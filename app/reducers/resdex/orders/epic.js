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

function convertRecentSwaps(swaps) {

  const orderStatus = events => {
    const isFailed = events.find(event => RESDEX.errorEvents.includes(event.event.type))

    if (isFailed) {
      return 'failed'
    }

    const lastEvent = events[events.length-1]
    const lastEventType = lastEvent.event.type

    switch (lastEventType) {
      case 'Finished':
        return 'completed'
      case 'Negotiated':
        return 'matched'
      default:
    }

    return 'swapping'
  }

  const finishedOrders = ['completed', 'failed', 'cancelled']

  const convert = swap => {
    let order = {
      uuid: swap.uuid,
      status: 'pending',
      price: null,
      baseTxId: null,
      quoteTxId: null,
      isMarket: swap.type === 'Taker',
      isPrivate: false,
      isActive: true,
      isSwap: true,
      isHidden: false,
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
    let isActive = !finishedOrders.includes(status)

    const momentStarted = moment(startedEvent.timestamp)

    if (isActive && momentStarted.isBefore(moment().subtract(1, 'hours'))) {
      status = 'failed'
      isActive = false
    }

    order = {
      ...order,
      price: baseCurrencyAmount.div(quoteCurrencyAmount),
      baseCurrency: startedEvent.event.data.maker_coin,
      quoteCurrency: startedEvent.event.data.taker_coin,
      baseCurrencyAmount,
      quoteCurrencyAmount,
      baseTxId: makerPayment && makerPayment.event.data.tx_hash,
      quoteTxId: takerPayment && takerPayment.event.data.tx_hash,
      eventTypes: swap.events.map(e => e.event.type),
      timeStarted: momentStarted.toDate(),
      status,
      isActive,
    }

    return order
  }
  const orders = swaps.map(convert)

  return orders
}

function applyPrivateSwaps(orders, privateSwaps) {
  const finishedOrders = ['completed', 'failed', 'cancelled']

  const convert = o => {
    const privateSwap = privateSwaps[o.uuid]
    const isHidden = Boolean(Object.values(privateSwaps).find(s => o.uuid === s.privacy2Uuid))

    let order

    if (privateSwap) {
      const linkedOrder = orders.find(r => r.uuid === privateSwap.privacy2Uuid)

      order = {
        ...o,
        price: privateSwap.baseCurrencyAmount.div(privateSwap.quoteCurrencyAmount),
        privacy: privateSwap,
        eventTypes: linkedOrder ? linkedOrder.eventTypes : o.eventTypes,
        baseCurrency: privateSwap.baseCurrency,
        quoteCurrency: privateSwap.quoteCurrency,
        baseCurrencyAmount: privateSwap.baseCurrencyAmount,
        quoteCurrencyAmount: privateSwap.quoteCurrencyAmount,
        isHidden,
        isActive: !finishedOrders.includes(privateSwap.status),
        isPrivate: true,
      }
    } else {
      order = {
        ...o,
        isHidden
      }
    }

    return order
  }

  return orders.map(convert)
}

function convertOrders(makerOrders) {
  log.debug(`Maker orders`, makerOrders)

  const orders = makerOrders
    .map(o => ({
      ...o,
      status: 'pending',
      isPrivate: false,
      isHidden: false,
      isActive: true,
      isMarket: o.type === 'Taker',
      isSwap: false,
      privacy: null,
    }))
    // TODO: Remove once fixed
    // Filtering out empty orders (ResDEX backend bug)
    .filter(o => Boolean(o.baseCurrency))

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

        const orders = applyPrivateSwaps(
          (
            convertRecentSwaps(recentSwaps, privateSwaps)
            .concat(convertOrders(pendingOrders))
          ),
          privateSwaps
        )

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

const cancelPrivateOrder = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexOrdersActions.cancelPrivateOrder),
  switchMap(action => {
    const { uuid } = action.payload
    return of(
      ResDexOrdersActions.setPrivateOrderStatus(uuid, 'failed'),
      ResDexOrdersActions.cancelOrder(uuid)
    )
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
    config.set(`resDex.privateSwaps.${uuid}.privacy2Uuid`, baseResOrderUuid)
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
  cancelPrivateOrder(action$, state$),
  setPrivateOrderStatus(action$, state$),
  linkPrivateOrderToBaseResOrder(action$, state$),
  savePrivateOrder(action$, state$),
)
