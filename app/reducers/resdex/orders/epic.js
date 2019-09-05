// @flow
import { Decimal } from 'decimal.js'
import moment from 'moment'
import { remote } from 'electron'
import log from 'electron-log'
import { of, from, merge } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'
import config from 'electron-settings'

import { RESDEX } from '~/constants/resdex'
import { flattenDecimals } from '~/utils/decimal'
import { translate } from '~/i18next.config'
import { resDexApiFactory } from '~/service/resdex/api'
import { ResDexOrdersActions } from './reducer'


const t = translate('resdex')
const mainApi = resDexApiFactory('RESDEX')

function convertRecentSwaps(swaps, privateSwaps) {

  const orderStatus = events => {
    const unmatched = events.find(event => event.event.type === 'NegotiateFailed')

    if (unmatched) {
      return 'failed'
    }

    const lastEvent = events[events.length-1]
    const lastEventType = lastEvent.event.type

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

  const convert = swap => {
    const privateSwap = privateSwaps[swap.uuid]
    const isHidden = Boolean(Object.values(privateSwaps).find(s => swap.uuid === s.privacy2Uuid))

    let order = {
      uuid: swap.uuid,
      status: 'pending',
      price: null,
      baseTxId: null,
      quoteTxId: null,
      isMarket: swap.type === 'Taker',
      isPrivate: Boolean(privateSwap),
      isActive: true,
      isSwap: true,
      isHidden,
    }

    if (!swap.events.length) {
      return order
    }

    const findEvent = (type: string) => swap.events.find(e => e.event.type === type)
    const startedEvent = findEvent('Started')

    const makerPayment = findEvent('MakerPaymentReceived')
    const takerPayment = findEvent('TakerPaymentSent')

    const baseCurrencyAmount = Decimal(startedEvent.event.data.maker_amount)
    const quoteCurrencyAmount = Decimal(startedEvent.event.data.taker_amount)

    let status = orderStatus(swap.events)
    const finishedOrders = ['completed', 'failed', 'cancelled']
    let isActive = !finishedOrders.includes(status)

    const momentStarted = moment(startedEvent.timestamp)

    if (isActive && momentStarted.isBefore(moment().subtract(1, 'hours'))) {
      status = 'failed'
      isActive = false
    }

    if (privateSwap) {
      order = {
        ...order,
        price: privateSwap.baseCurrencyAmount.div(privateSwap.quoteCurrencyAmount),
        privacy: privateSwap,
        baseCurrency: privateSwap.baseCurrency,
        quoteCurrency: privateSwap.quoteCurrency,
        baseCurrencyAmount: privateSwap.baseCurrencyAmount,
        quoteCurrencyAmount: privateSwap.quoteCurrencyAmount,
      }
    } else {
      order = {
        ...order,
        price: baseCurrencyAmount.div(quoteCurrencyAmount),
        baseCurrency: startedEvent.event.data.maker_coin,
        quoteCurrency: startedEvent.event.data.taker_coin,
        baseCurrencyAmount,
        quoteCurrencyAmount,
      }
    }

    order = {
      ...order,
      baseTxId: makerPayment && makerPayment.event.data.tx_hash,
      quoteTxId: takerPayment && takerPayment.event.data.tx_hash,
      eventTypes: swap.events.map(e => e.event.type),
      timeStarted: momentStarted.toDate(),
      status,
      isActive: privateSwap ? !finishedOrders.includes(privateSwap.status) : isActive
    }

    return order
  }
  const orders = swaps.map(convert)

  return orders
}

function convertOrders(makerOrders) {
  log.debug(`Maker orders`, makerOrders)

  const orders = makerOrders.map(o => ({
    ...o,
    status: 'pending',
    isPrivate: false,
    isHidden: false,
    isActive: true,
    isMarket: o.type === 'Taker',
    isSwap: false,
    privacy: null,
  }))

  return orders
}

const getSwapHistoryEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexOrdersActions.getSwapHistory),
  switchMap(() => {
    const processNames = ['RESDEX', 'RESDEX_PRIVACY2', null]

    const getRecentSwapsPromise = Promise.all(processNames.map(processName => {
      if (processName === null) {
        return mainApi.getOrders()
      }

      const api = resDexApiFactory(processName)
      return api.getRecentSwaps()
    }))

    const { privateSwaps } = state$.value.resDex.orders

    const observable = from(getRecentSwapsPromise).pipe(
      switchMap(([mainSwaps, privacy2Swaps, pendingOrders]) => {
        const recentSwaps = mainSwaps.swaps.concat(privacy2Swaps.swaps)

        const orders = convertRecentSwaps(recentSwaps, privateSwaps)
          .concat(convertOrders(pendingOrders))

        log.debug(`Orders list updated, ${JSON.stringify(orders)}`)

        // Track pending activities to ask user for a quit confirmation
        remote.getGlobal('pendingActivities').orders = Boolean(
          orders.find(order => !['completed', 'failed', 'cancelled'].includes(order.status))
        )

        return of(ResDexOrdersActions.gotSwapHistory(orders))
      }),
      catchError(err => {
        log.error(`Error getting recent swaps`, err)
        if (!state$.value.resDex.login.isInProgress) {
          toastr.error(t(`Error getting orders list`))
        }
        return of(ResDexOrdersActions.getSwapHistoryFailed())
      })
    )

    return observable
  })
)

const cancelOrder = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexOrdersActions.cancelOrder),
  switchMap(action => {
    const { uuid } = action.payload
    return from(mainApi.cancelOrder(uuid))
  }),
  switchMap(isSuccess => {
    if (isSuccess) {
      toastr.success(t(`Order cancelled successfully`))
    } else {
      toastr.info(t(`ResDEX was unable to cancel the order upon your request`))
    }

    return of (ResDexOrdersActions.cancelOrderFinished())
  }),
  catchError(err => {
    log.error(`Error cancelling the order`, err)
    toastr.error(t(`Error cancelling the order, check the log for details`))
    return of(ResDexOrdersActions.cancelOrderFinished())
  })
)

const savePrivateOrder = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexOrdersActions.savePrivateOrder),
  map(action => {
    const { order } = action.payload
    config.set(`resDex.privateSwaps.${order.mainUuid}`, flattenDecimals(order))
    return ResDexOrdersActions.empty()
  })
)

const linkPrivateOrderToBaseResOrder = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexOrdersActions.linkPrivateOrderToBaseResOrder),
  map(action => {
    const { uuid, baseResOrderUuid } = action.payload
    config.set(`resDex.privateSwaps.${action.payload.uuid}.privacy2Uuid`, baseResOrderUuid)
    return ResDexOrdersActions.empty()
  })
)

const setPrivateOrderStatus = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexOrdersActions.setPrivateOrderStatus),
  map(action => {
    const { status } = action.payload
    config.set(`resDex.privateSwaps.${action.payload.uuid}.status`, status)
    return ResDexOrdersActions.empty()
  })
)

export const ResDexOrdersEpic = (action$, state$) => merge(
  getSwapHistoryEpic(action$, state$),
  cancelOrder(action$, state$),
  setPrivateOrderStatus(action$, state$),
  linkPrivateOrderToBaseResOrder(action$, state$),
  savePrivateOrder(action$, state$),
)
