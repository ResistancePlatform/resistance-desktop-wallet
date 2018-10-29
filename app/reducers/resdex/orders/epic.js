// @flow
import moment from 'moment'
import pMap from 'p-map'
import { remote } from 'electron'
import log from 'electron-log'
import { of, from, merge } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { actions as toastrActions } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { getStore } from '~/store/configureStore'
import { SwapDBService } from '~/service/resdex/swap-db'
import { ResDexApiService } from '~/service/resdex/api'
import { ResDexOrdersActions } from './reducer'


const t = translate('resdex')
const swapDB = new SwapDBService()
const api = new ResDexApiService()

const kickStartStuckSwapsEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexOrdersActions.kickStartStuckSwaps),
  switchMap(() => {
    const { isInitialKickStartDone, swapHistory } = state$.value.resDex.orders

    const stuckSwaps = swapHistory.filter(swap => (
      swap.status === 'swapping' &&
        (!isInitialKickStartDone || moment(swap.timeStarted).isBefore(moment().subtract(4, 'hours')))
    ))

    log.info(`Kick starting ${stuckSwaps.length} stuck orders`)

    const kickStartPromise = pMap(
      stuckSwaps,
      swap => api.kickstart(swap.requestId, swap.quoteId),
      { concurrency: 1 }
    )

    const observable = from(kickStartPromise).pipe(
      switchMap(() => {
        log.info(`Stuck orders kick start completed`)
        return of(ResDexOrdersActions.kickStartStuckSwapsSucceeded())
      }),
      catchError(err => {
        log.error(`Error kick starting stuck swaps`, err)
        return of(
          toastrActions.add({
            type: 'error',
            title: t(`Can't kick start stuck swaps, check the application log for details`)
          }),
          ResDexOrdersActions.kickStartStuckSwapsFailed()
        )
      })
    )

    return observable
  })
)

const initSwapHistoryEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexOrdersActions.initSwapHistory),
  map(() => {
    const store = getStore()

    swapDB.on('change', () => {
      store.dispatch(ResDexOrdersActions.getSwapHistory())
    })

    api.enableSocket()
    return ResDexOrdersActions.getSwapHistory()
  })
)

const getSwapHistoryEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexOrdersActions.getSwapHistory),
  switchMap(() => {
    const observable = from(swapDB.getSwaps()).pipe(
      switchMap(swapHistory => {
        log.debug(`Swap history changed, got ${swapHistory.length} swaps`)

        swapHistory.forEach(swap => {
          if (swap.status === 'pending') {
            log.debug(JSON.stringify(swap))
          }
        })

        remote.getGlobal('pendingActivities').orders = Boolean(
          swapHistory.find(swap => !['completed', 'failed'].includes(swap.status))
        )

        return of(ResDexOrdersActions.gotSwapHistory(swapHistory))
      }),
      catchError(err => {
        log.error(`Error getting swap history`, err)

        return of(toastrActions.add({
          type: 'error',
          title: t(`Error getting swap history`)
        }))
      })
    )

    return observable
  })
)

const cleanupPendingSwapsEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexOrdersActions.cleanupPendingSwaps),
  switchMap(() => {

    const observable = from(api.getPendingSwaps()).pipe(
      map(swaps => {
        const swapsByUuid = swaps.reduce((previous, swap) => ({...previous, [swap.uuid]: swap}), {})

        const { swapHistory } = state$.value.resDex.orders
        const pendingOrders = swapHistory.filter(swap => swap.status === 'pending')

        pendingOrders.forEach(order => {
          const isPendingForAWhile = moment(order.timeStarted).isBefore(moment().subtract(5, 'minutes'))

          if (!(order.uuid in swapsByUuid) && isPendingForAWhile) {
            log.warn(`Order ${order.uuid} not found in ResDEX pendings`)
            swapDB.forceSwapFailure(order.uuid)
          }
        })

        return ResDexOrdersActions.gotPendingSwaps(swapsByUuid)
      }),
      catchError(err => {
        log.error(`Can't get pending swaps`, err)

        return of(
          ResDexOrdersActions.cleanupPendingSwapsFailed(),
          toastrActions.add({
            type: 'error',
            title: t(`Error updating swap statuses`)
          })
        )
      })
    )

    return observable
  })
)

export const ResDexOrdersEpic = (action$, state$) => merge(
  cleanupPendingSwapsEpic(action$, state$),
  kickStartStuckSwapsEpic(action$, state$),
  initSwapHistoryEpic(action$, state$),
  getSwapHistoryEpic(action$, state$),
)
