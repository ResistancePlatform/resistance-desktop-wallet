// @flow
import log from 'electron-log'
import { of, from, merge } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { toastr, actions as toastrActions } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { getStore } from '~/store/configureStore'
import { SwapDBService } from '~/service/resdex/swap-db'
import { ResDexApiService } from '~/service/resdex/api'
import { ResDexOrdersActions } from './reducer'


const t = translate('resdex')
const swapDB = new SwapDBService()
const api = new ResDexApiService()

const initSwapHistoryEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexOrdersActions.initSwapHistory),
  map(() => {
    const store = getStore()
    swapDB.on('change', () => { store.dispatch(ResDexOrdersActions.getSwapHistory()) } )

    from(api.enableSocket()).pipe(
      map(() => {

        return ResDexOrdersActions.empty()
      })
    )

    return ResDexOrdersActions.getSwapHistory()
  })
)

const getSwapHistoryEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexOrdersActions.getSwapHistory),
  switchMap(() => {
    const observable = from(swapDB.getSwaps()).pipe(
      switchMap(swapHistory => {
        log.debug(`Swap history changed, got ${swapHistory.length} swaps`)
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

export const ResDexOrdersEpic = (action$, state$) => merge(
  initSwapHistoryEpic(action$, state$),
  getSwapHistoryEpic(action$, state$),
)
