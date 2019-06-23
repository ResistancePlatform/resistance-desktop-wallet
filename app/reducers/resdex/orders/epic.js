// @flow
import { Decimal } from 'decimal.js'
import moment from 'moment'
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
  const satoshiToAmount = satoshi => Decimal(satoshi).dividedBy(100000000)

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
      isActive: true,
    }

    if (!swap.events.length) {
      return order
    }

    const findEvent = (type: string) => swap.events.find(e => e.event.type === type)
    const startedEvent = findEvent('Started')
    const lastEvent = swap.events[swap.events.length-1]

    const makerPayment = findEvent('MakerPaymentReceived')
    const takerPayment = findEvent('TakerPaymentSent')

    const baseCurrencyAmount = Decimal(startedEvent.event.data.maker_amount)
    const quoteCurrencyAmount = Decimal(startedEvent.event.data.taker_amount)

    let status = orderStatus(lastEvent.event.type)
    let isActive = !['completed', 'failed', 'cancelled'].includes(status)

    const momentStarted = moment(startedEvent.timestamp)

    if (isActive && momentStarted.isBefore(moment().subtract(1, 'hours'))) {
      status = 'failed'
      isActive = false
    }

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
      timeStarted: momentStarted.toDate(),
      status,
      isActive,
    }

    return order
  })

  return orders
}

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
)
