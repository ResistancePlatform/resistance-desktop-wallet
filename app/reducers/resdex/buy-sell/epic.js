// @flow
import { Decimal } from 'decimal.js'
import log from 'electron-log'
import { of, from, merge, interval, defer } from 'rxjs'
import { map, mapTo, take, filter, switchMap, catchError } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'
import { tsvParse } from  'd3-dsv'
import { timeParse } from 'd3-time-format'

import { translate } from '~/i18next.config'
import { RESDEX } from '~/constants/resdex'
import { flattenDecimals } from '~/utils/decimal'
import { resDexApiFactory } from '~/service/resdex/api'
import { RoundedFormActions } from '~/reducers/rounded-form/rounded-form.reducer'
import { ResDexBuySellActions } from './reducer'


const t = translate('resdex')
const mainApi = resDexApiFactory('RESDEX')

const getOrderBookEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexBuySellActions.getOrderBook),
  switchMap(() => {
    const { baseCurrency, quoteCurrency } = state$.value.resDex.buySell
    const getOrderBookPromise = Promise.all([
      mainApi.getOrderBook(baseCurrency, quoteCurrency),
      mainApi.getOrderBook('RES', quoteCurrency),
      mainApi.getOrderBook(baseCurrency, 'RES'),
    ])
    const observable = from(getOrderBookPromise).pipe(
      switchMap(([baseQuote,  resQuote, baseRes]) => {
        const orderBook = {
          baseCurrency,
          quoteCurrency,
          baseQuote,
          resQuote,
          baseRes
        }
        log.debug('Order book prices')
        log.debug(JSON.stringify(baseQuote))
        if (baseQuote.asks.length) {
          log.debug('baseQuote', baseQuote.asks[0])
        }
        log.debug(JSON.stringify(resQuote))
        if (resQuote.asks.length) {
          log.debug('resQuote', resQuote.asks[0])
        }
        log.debug(JSON.stringify(baseRes))
        if (baseRes.asks.length) {
          log.debug('baseRes', baseRes.asks[0])
        }
        return of(ResDexBuySellActions.gotOrderBook(orderBook))
      }),
      catchError(err => {
        log.error(`Can't get order book`, err)
        return of(ResDexBuySellActions.getOrderBookFailed(err.message))
      })
    )

    return observable
  })
)

const getOrderBookFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.getOrderBookFailed),
  map(action => {
    toastr.error(t(`Error getting the order book`), action.payload.errorMessage)
    return ResDexBuySellActions.empty()
  })
)

const createOrderEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexBuySellActions.createOrder),
  switchMap(() => {
    const { fields } = state$.value.roundedForm.resDexBuySell
    let { price } = fields
    const { isMarketOrder, maxRel } = fields
    const { baseCurrency, quoteCurrency, orderBook } = state$.value.resDex.buySell

    if (isMarketOrder && !price) {
      const { price: askPrice } = orderBook.baseQuote.asks[0]
      price = askPrice.times(Decimal('1.0001'))
    }

    const orderOptions = {
      baseCurrency,
      quoteCurrency,
      quoteCurrencyAmount: Decimal(maxRel),
      price: Decimal(price),
      isMarketOrder
    }

    if (isMarketOrder) {
      return getCreateMarketOrderObservable(
        'RESDEX',
        orderOptions,
        null,
        () => of(ResDexBuySellActions.createOrderSucceeded()),
        ResDexBuySellActions.createOrderFailed,
        state$
      )
    }

    return getCreateLimitOrderObservable(
      orderOptions,
      of(ResDexBuySellActions.createOrderSucceeded()),
      ResDexBuySellActions.createOrderFailed,
      state$
    )
  })
)

const getCreateMarketOrderObservable = (processName, options, privacy, getSuccessObservable, failureAction) => {
  const {
    baseCurrency,
    quoteCurrency,
    quoteCurrencyAmount,
    price
  } = options

  const api = resDexApiFactory(processName)
  // const txFee = state$.value.resDex.accounts.currencyFees[quoteCurrency]
  //
  // const dexFee = RESDEX.dexFee.div(Decimal('100'))
  // const divider = price.plus(price.times(dexFee)).plus(txFee)

  const requestOpts = {
    type: 'buy',
    baseCurrency,
    quoteCurrency,
    price,
    amount: Decimal(quoteCurrencyAmount).dividedBy(price).toDP(8, Decimal.ROUND_FLOOR),
    total: Decimal(quoteCurrencyAmount).toDP(8, Decimal.ROUND_FLOOR)
  }

  log.debug(`Submitting a swap (market order)`, flattenDecimals(requestOpts))

  const orderObservable = from(api.createMarketOrder(requestOpts)).pipe(
    switchMap(result => {
      log.debug(`Buy response:`, JSON.stringify(result))

      if (!result || !result.uuid) {
        const message = t(`Something unexpected happened. Are you sure you have enough UTXO?`)
        return of(failureAction(message))
      }

      return getSuccessObservable(result.uuid)
    }),
    catchError(err => {
      let { message } = err
      log.error(`Swap error`, err)

      if (message === 'only one pending request at a time') {
        message = t(`Only one pending swap at a time, try again in {{wait}} seconds.`, { wait: err.response.wait})
      }

      return of(failureAction(message))
    })
  )

  return orderObservable
}

const getCreateLimitOrderObservable = (options, successObservable, failureAction) => {
  const {
    baseCurrency,
    quoteCurrency,
    quoteCurrencyAmount,
    price
  } = options

  const requestOpts = {
    baseCurrency,
    quoteCurrency,
    baseCurrencyAmount: quoteCurrencyAmount.dividedBy(price).times(Decimal('0.999')),
    price,
  }

  log.debug(`Submitting a swap (limit order)`, requestOpts)

  const orderObservable = from(mainApi.createLimitOrder(requestOpts)).pipe(
    switchMap(response => {
      if (response.result !== 'success') {
        const message = t(`Something unexpected happened. Are you sure you have enough UTXO?`)
        return of(failureAction(message))
      }

      // const swap = {
      //   uuid: createUuid(),
      //   base: baseCurrency,
      //   rel: quoteCurrency,
      //   basevalue: 0,
      //   relvalue: 0,
      // }
      //
      // const { swapHistory } = state$.value.resDex.orders
      //
      // const previousSwap = swapHistory.find(order => (
      //   !order.isMarket
      //   && order.isActive
      //   && order.baseCurrency === baseCurrency
      //   && order.quoteCurrency === quoteCurrency
      // ))
      //
      // if (previousSwap) {
      //   log.debug(`Cancelling the existing limit order(s)`)
      //   // TODO: Fix for ResDEX 2
      //   // swapDB.forceSwapStatus(previousSwap.uuid, 'cancelled')
      // }

      // Amount and total are just for the display
      // TODO: Fix for ResDEX 2
      // const flattenedOptions = flattenDecimals({
      //   ...requestOpts,
      //   amount: Decimal(quoteCurrencyAmount).dividedBy(price).toDP(8, Decimal.ROUND_FLOOR),
      //   total: Decimal(quoteCurrencyAmount).toDP(8, Decimal.ROUND_FLOOR),
      //   isMarket: false,
      // })
      // log.debug(`Inserting a swap`, swap, flattenedOptions)
      // swapDB.insertSwapData(swap, flattenedOptions, false)

      return successObservable
    }),
    catchError(err => {
      log.error(`Swap error`, err)
      return of(failureAction(t(`Can't create a limit order, check the log for details`)))
    })
  )

  return orderObservable
}

const getRelResOrderObservable = (privacy, getSuccessObservable, state$) => {
    const { quoteCurrency, orderBook } = state$.value.resDex.buySell
    const { quoteCurrencyAmount } = privacy
    const { price: askPrice } = orderBook.resQuote.asks[0]

    const orderOptions = {
      baseCurrency: 'RES',
      quoteCurrency,
      quoteCurrencyAmount,
      price: askPrice.times(Decimal('1.0001')),
    }
    log.debug(`Private market order stage 1, ${quoteCurrency} -> RES`, orderOptions)

    return getCreateMarketOrderObservable(
      'RESDEX',
      orderOptions,
      privacy,
      getSuccessObservable,
      ResDexBuySellActions.createPrivateOrderFailed,
      state$
    )

}

const getPollMainProcessBalanceObservable = (privacy, withdrawFromMainToPrivacy1Observable, state$) => {
  log.debug(`Private market order stage 2, polling the main ResDEX process for RES balance`, privacy)

  const pollingObservable = interval(1000).pipe(
    map(() => {
      const { balance } = state$.value.resDex.accounts.currencies.RESDEX.RES
      log.debug(`Polling main ResDEX process for RES balance:`, balance.toString())
      return balance
    }),
    filter(balance => balance.greaterThan(privacy.initialMainResBalance)),
    take(1),
    switchMap(() => withdrawFromMainToPrivacy1Observable)
  )
  return pollingObservable
}

const getWithdrawFromMainToPrivacy1Observable = (privacy, pollPrivacy2BalanceObservable, state$) => {
  const { currencies } = state$.value.resDex.accounts
  const { address } = currencies.RESDEX_PRIVACY1.RES
  const { balance } = currencies.RESDEX.RES

  log.debug(`Private market order stage 3, withdrawing from the main ResDEX process to Privacy 1`, privacy)
  log.debug(`Withdrawal to: `, address)

  const observable = from(mainApi.withdraw({
    symbol: 'RES',
    address,
    amount: balance.minus(privacy.initialMainResBalance),
  })).pipe(
    switchMap(() => pollPrivacy2BalanceObservable),
    catchError(err => {
      log.error(`Can't withdraw from main to Privacy 1 process`, err)
      return of(ResDexBuySellActions.createPrivateOrderFailed(t(`Error performing Resistance withdrawal to a privatizer address`)))
    })
  )

  return observable
}

const getPollPrivacy2BalanceObservable = (privacy, resBaseOrderObservable, state$) => {
  log.debug(`Private market order stage 4, polling the Privacy 2 ResDEX process for RES balance`, privacy)

  const pollingObservable = interval(1000).pipe(
    map(() => {
      const { balance } = state$.value.resDex.accounts.currencies.RESDEX_PRIVACY2.RES
      log.debug(`Polling ResDEX Privacy 2 for RES balance:`, balance.toString(), privacy.initialPrivacy2ResBalance.toString())
      return balance
    }),
    filter(balance => balance.greaterThan(privacy.initialPrivacy2ResBalance)),
    take(1),
    switchMap(() => resBaseOrderObservable),
  )
  return pollingObservable
}

const getResBaseOrderObservable = (privacy, getSuccessObservable, state$) => {
  const { balance } = state$.value.resDex.accounts.currencies.RESDEX_PRIVACY2.RES
  const { orderBook } = state$.value.resDex.buySell
  const { baseCurrency, initialPrivacy2ResBalance } = privacy
  const { price: askPrice } = orderBook.baseRes.asks[0]

  const orderOptions = {
    baseCurrency,
    quoteCurrency: 'RES',
    quoteCurrencyAmount: balance.minus(initialPrivacy2ResBalance),
    price: askPrice.times(Decimal('1.0001')),
  }

  log.debug(`Private market order stage 5, RES -> ${baseCurrency}`, orderOptions)

  return getCreateMarketOrderObservable(
    'RESDEX_PRIVACY2',
    orderOptions,
    privacy,
    getSuccessObservable,
    ResDexBuySellActions.createPrivateOrderFailed,
    state$
  )
}

const getPollResBaseOrderObservable = (relResOrderUuid, resBaseOrderUuid, state$) => {
  const pollingObservable = interval(1000).pipe(
    map(() => {
      log.debug(`Polling RES base order to complete or fail...`)

      const { swapHistory } = state$.value.resDex.orders
      const order = swapHistory.filter(swap => swap.uuid === resBaseOrderUuid).pop()

      if (order) {
        log.debug(`Order status`, order.status, order.privacy.status)
      } else {
        log.debug(`Order not found`, resBaseOrderUuid)
      }

      return order
    }),
    filter(order => order && ['completed', 'failed'].includes(order.status)),
    take(1),
    map(order => ResDexBuySellActions.setPrivateOrderStatus(relResOrderUuid, order.status)),
  )

  return pollingObservable
}

const createPrivateOrderEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexBuySellActions.createPrivateOrder),
  switchMap(() => {
    const { currencies } = state$.value.resDex.accounts
    const { baseCurrency, quoteCurrency, orderBook } = state$.value.resDex.buySell
    const { maxRel } = state$.value.roundedForm.resDexBuySell.fields

    // Calculate expected amount to receive to display in the orders list
    const { price: baseResPrice } = orderBook.baseRes.asks[0]
    const { price: resQuotePrice } = orderBook.resQuote.asks[0]
    const dexFee = RESDEX.dexFee.dividedBy(Decimal('100'))
    const expectedBaseCurrencyAmount = (
      Decimal(maxRel)
      .dividedBy(resQuotePrice.plus(resQuotePrice.times(dexFee)))
      .dividedBy(baseResPrice)
    )

    const privacy = {
      baseCurrency,
      quoteCurrency,
      quoteCurrencyAmount: Decimal(maxRel),
      expectedBaseCurrencyAmount,
      initialMainResBalance: currencies.RESDEX.RES.balance,
      initialPrivacy2ResBalance: currencies.RESDEX_PRIVACY2.RES.balance,
      baseResOrderUuid: null,
    }

    log.debug(`Privacy`, privacy)

    // 1. Create order Rel -> RES on process1
    // 2. Poll for the process1 RES balance
    // 3. Withdraw from process1 to process2
    // 4. Poll for process3 balance
    // 5. Create order RES -> Base on process3

    let relResOrderUuid
    let resBaseOrderUuid

    const createResBaseOrderSuccessObservable = uuid => {
      resBaseOrderUuid = uuid

      return merge(
        of(ResDexBuySellActions.setPrivateOrderStatus(relResOrderUuid, 'swapping_res_base')),
        of(ResDexBuySellActions.linkPrivateOrderToBaseResOrder(uuid, resBaseOrderUuid)),
        getPollResBaseOrderObservable(relResOrderUuid, resBaseOrderUuid, state$),
      )
    }

    const resBaseOrderObservable = defer(() => getResBaseOrderObservable(privacy, createResBaseOrderSuccessObservable, state$))
    const pollPrivacy2BalanceObservable = defer(() => getPollPrivacy2BalanceObservable(privacy, resBaseOrderObservable, state$))

    const withdrawFromMainToPrivacy1Observable = defer(() => merge(
      of(ResDexBuySellActions.setPrivateOrderStatus(relResOrderUuid, 'privatizing')),
      getWithdrawFromMainToPrivacy1Observable(privacy, pollPrivacy2BalanceObservable, state$),
    ))

    const pollMainProcessBalanceObservable = defer(() => getPollMainProcessBalanceObservable(privacy, withdrawFromMainToPrivacy1Observable, state$))

    const createRelResOrderSuccessObservable = uuid => {
      relResOrderUuid = uuid

      return merge(
        pollMainProcessBalanceObservable,
        of(ResDexBuySellActions.setPrivateOrderStatus(relResOrderUuid, 'swapping_rel_res')),
        of(ResDexBuySellActions.createPrivateOrderSucceeded()),
      )
    }

    const relResOrderObservable = getRelResOrderObservable(privacy, createRelResOrderSuccessObservable, state$)

    return relResOrderObservable
  })
)

const createOrderSucceededEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.createOrderSucceeded),
  map(() => {
    toastr.success(t(`Market order created successfully`))
    return ResDexBuySellActions.empty()
  })
)

const createPrivateOrderSucceededEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.createPrivateOrderSucceeded),
  map(() => {
    toastr.success(t(`Private order created successfully`), t(`New orders creation locked until the trade complete`))
    return ResDexBuySellActions.empty()
  })
)

const createOrderFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.createOrderFailed),
  map(action => {
    toastr.error(t(`Error creating a market order`), action.payload.errorMessage)
    return ResDexBuySellActions.empty()
  })
)

const linkPrivateOrderToBaseResOrderEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.linkPrivateOrderToBaseResOrder),
  // swapDB.updateSwapData({
  //   uuid: action.payload.uuid,
  //   method: 'set_private_order_base_res_uuid',
  //   baseResOrderUuid: action.payload.baseResOrderUuid,
  // })
  map(() => ResDexBuySellActions.empty())
)

const setPrivateOrderStatusEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.setPrivateOrderStatus),
  // swapDB.updateSwapData({
  //   uuid: action.payload.uuid,
  //   method: 'set_private_order_status',
  //   status: action.payload.status,
  // })
  map(() => ResDexBuySellActions.empty())
)

const selectTabEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.selectTab),
  mapTo(RoundedFormActions.clear('resDexBuySell'))
)

const getOhlcEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
  ofType(ResDexBuySellActions.getOhlc),
  switchMap(() => {
    const { baseCurrency, quoteCurrency } = state$.value.resDex.buySell

    function parseData(parse) {
      return d => ({
        ...d,
        date: parse(d.date),
        open: +d.open,
        high: +d.high,
        low: +d.low,
        close: +d.close,
        volume: +d.volume,
      })
    }

    const msftDataPromise = (
      fetch("https://cdn.rawgit.com/rrag/react-stockcharts/master/docs/data/MSFT.tsv")
        .then(response => response.text())
        .then(data => tsvParse(data, parseData(timeParse("%Y-%m-%d"))))
    )

    // const ohlcObservable = from(mainApi.getOhlc(baseCurrency, quoteCurrency, 60 * 60 * 24)).pipe(
    const ohlcObservable = from(msftDataPromise).pipe(
      map(ohlc => ResDexBuySellActions.gotOhlc(ohlc)),
      catchError(err => {
        log.error(`Can't get order ticks`, err)
        toastr.error(t(`Error getting price ticks, please check the log for details`))
        return of(ResDexBuySellActions.getOhlcFailed())
      })
    )

    return ohlcObservable
  })
)

const getTradesEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
  ofType(ResDexBuySellActions.getTrades),
  switchMap(() => {
    const { baseCurrency, quoteCurrency } = state$.value.resDex.buySell

    const tradesObservable = from(mainApi.getTrades(baseCurrency, quoteCurrency)).pipe(
      map(trades => ResDexBuySellActions.gotTrades(trades)),
      catchError(err => {
        log.error(`Can't get order trades`, err)
        toastr.error(t(`Error getting trades, please check the log for details`))
        return of(ResDexBuySellActions.getTradesFailed())
      })
    )

    return tradesObservable
  })
)

export const ResDexBuySellEpic = (action$, state$) => merge(
  createOrderEpic(action$, state$),
  createPrivateOrderEpic(action$, state$),
  createOrderSucceededEpic(action$, state$),
  createPrivateOrderSucceededEpic(action$, state$),
  createOrderFailedEpic(action$, state$),
  getOrderBookEpic(action$, state$),
  getOrderBookFailedEpic(action$, state$),
  setPrivateOrderStatusEpic(action$, state$),
  linkPrivateOrderToBaseResOrderEpic(action$, state$),
  selectTabEpic(action$, state$),
  getOhlcEpic(action$, state$),
  getTradesEpic(action$, state$),
)

