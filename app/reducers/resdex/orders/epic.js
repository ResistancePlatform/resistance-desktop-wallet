// @flow
import { Decimal } from 'decimal.js'
import moment from 'moment'
import pMap from 'p-map'
import { remote } from 'electron'
import log from 'electron-log'
import { of, from, merge } from 'rxjs'
import { switchMap, catchError } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { RESDEX } from '~/constants/resdex'
import { translate } from '~/i18next.config'
import { resDexApiFactory } from '~/service/resdex/api'
import { ResDexOrdersActions } from './reducer'


const t = translate('resdex')
const api = resDexApiFactory('RESDEX')

function recentSwapsToOrders(swaps) {
  const satoshiToAmount = satoshi => Decimal(satoshi).div(100000000)

  const orderStatus = lastEventType => {
    switch (lastEventType) {
      case 'Finished':
        return 'completed'
      case 'Negotiated':
        return 'matched'
      case 'NegotiateFailed':
        return 'unmatched'
      case RESDEX.errorEvents.includes(lastEventType):
        return 'failed'
      default:
    }
    return 'swapping'
  }

  const orders = swaps.swaps.map(swap => {
    let order = {
      uuid: swap.uuid,
      status: 'pending',
      price: null,
      baseTxId: null,
      quoteTxId: null,
      isMarket: swap.type === 'Taker',
      isPrivate: false,
      isHidden: false,
    }

    if (!swap.events.length) {
      return order
    }

    const findEvent = (type: string) => swap.events.find(e => e.event.type === type)
    const startedEvent = findEvent('Started')
    const lastEvent = swap.events[swap.events.length-1]

    const makerPayment = findEvent('MakerPaymentReceived')
    const takerPayment = findEvent('TakerPaymentSent')

    const baseCurrencyAmount = satoshiToAmount(startedEvent.event.data.maker_amount)
    const quoteCurrencyAmount = satoshiToAmount(startedEvent.event.data.taker_amount)

    order = {
      ...order,
      baseCurrency: startedEvent.event.data.maker_coin,
      quoteCurrency: startedEvent.event.data.taker_coin,
      baseCurrencyAmount,
      quoteCurrencyAmount,
      price: baseCurrencyAmount.div(quoteCurrencyAmount),
      baseTxId: makerPayment && makerPayment.event.data.tx_hash,
      quoteTxId: takerPayment && takerPayment.event.data.tx_hash,
      eventTypes: swap.events.map(e => e.event.type),
      status: orderStatus(lastEvent.event.type),
      timeStarted: moment.unix(startedEvent.timestamp / 1000.0).toDate(),
    }

    return order
  })

  return orders
}

const kickStartStuckSwapsEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexOrdersActions.kickStartStuckSwaps),
  switchMap(() => {
    const { isInitialKickStartDone, swapHistory } = state$.value.resDex.orders

    const stuckSwaps = swapHistory.filter(swap => (
      !swap.isPrivate
      && swap.status === 'swapping'
      && (!isInitialKickStartDone || moment(swap.timeStarted).isBefore(moment().subtract(4, 'hours')))
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
        toastr.error(t(`Can't kick start stuck swaps, check the application log for details`))
        return of(ResDexOrdersActions.kickStartStuckSwapsFailed())
      })
    )

    return observable
  })
)

const getSwapHistoryEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexOrdersActions.getSwapHistory),
  switchMap(() => {
    const observable = from(api.getRecentSwaps()).pipe(
      switchMap(recentSwaps => {
        const orders = recentSwapsToOrders(recentSwaps)
        log.debug(`Orders list updated, ${JSON.stringify(orders)}`)

        // Track pending activities to ask user for a quit confirmation
        remote.getGlobal('pendingActivities').orders = Boolean(
          orders.find(order => !['completed', 'failed', 'cancelled'].includes(order.status))
        )

        return of(ResDexOrdersActions.gotSwapHistory(orders))
      }),
      catchError(err => {
        log.error(`Error getting recent swaps`, err)
        toastr.error(t(`Error getting orders list`))
        return of(ResDexOrdersActions.getSwapHistoryFailed())
      })
    )

    return observable
  })
)

export const ResDexOrdersEpic = (action$, state$) => merge(
  getSwapHistoryEpic(action$, state$),
  kickStartStuckSwapsEpic(action$, state$),
)
