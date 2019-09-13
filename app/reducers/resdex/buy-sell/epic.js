// @flow
import { Decimal } from 'decimal.js'
import log from 'electron-log'
import { of, from, merge, interval, defer } from 'rxjs'
import { map, mapTo, take, filter, switchMap, catchError } from 'rxjs/operators'
import { getCurrency } from '~/utils/resdex'
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
import { ResDexOrdersActions } from '~/reducers/resdex/orders/reducer'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'

function getMsftOhlcDataPromise() {
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
    return msftDataPromise
}

const t = translate('resdex')
const mainApi = resDexApiFactory('RESDEX')

const getOrderBook = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexBuySellActions.getOrderBook),
  switchMap(() => {
    const { baseCurrency, quoteCurrency } = state$.value.resDex.buySell

    const emptyBook = { asks: [], bids: [] }

    const getOrderBookPromise = Promise.all([
      mainApi.getOrderBook(baseCurrency, quoteCurrency),
      quoteCurrency !== 'RES'
        ? mainApi.getOrderBook('RES', quoteCurrency)
        : emptyBook,
      baseCurrency !== 'RES'
        ? mainApi.getOrderBook(baseCurrency, 'RES')
        : emptyBook,
    ])

    const observable = from(getOrderBookPromise).pipe(
      switchMap(([baseQuote, resQuote, baseRes]) => {
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

const getOrderBookFailed = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.getOrderBookFailed),
  map(action => {
    toastr.error(t(`Error getting the order book`), action.payload.errorMessage)
    return ResDexBuySellActions.empty()
  })
)

const createOrder = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexBuySellActions.createOrder),
  switchMap(() => {
    if (!verifyBitcoinAmount(state$)) {
      return of(ResDexBuySellActions.createOrderRejected())
    }

    const nextObservable = verifyErc20(state$, false)

    if (nextObservable !== null) {
      return nextObservable
    }

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
    // Base/Rel are reverted for setprice orders
    baseCurrency: quoteCurrency,
    quoteCurrency: baseCurrency,
    // baseCurrencyAmount: quoteCurrencyAmount.dividedBy(price).times(Decimal('0.999')),
    baseCurrencyAmount: quoteCurrencyAmount,
    price,
  }

  log.debug(`Submitting a swap (limit order)`, requestOpts)

  const orderObservable = from(mainApi.createLimitOrder(requestOpts)).pipe(
    switchMap(result => {
      log.debug(`Limit response:`, JSON.stringify(result))

      if (!result || !result.uuid) {
        const message = t(`Something unexpected happened. Are you sure you have enough UTXO?`)
        return of(failureAction(message))
      }

      return successObservable
    }),
    catchError(err => {
      log.error(`Can't create a limit order:`, err)
      return of(failureAction(err.message))
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

const getWithdrawFromMainToPrivacy1Observable = (privacy, resBaseOrderObservable, state$, relResOrderUuid) => {
  const { currencies } = state$.value.resDex.accounts
  const { balance: privacy1Balance, address } = currencies.RESDEX_PRIVACY1.RES
  const { balance } = currencies.RESDEX.RES

  log.debug(`Private market order stage 3, withdrawing from the main ResDEX process to Privacy 1`, privacy)
  log.debug(`Withdrawal to: `, address, `amount:`, balance.minus(privacy.initialMainResBalance).toString())

  const initialPrivacy1ResBalance = balance.minus(privacy.initialMainResBalance).plus(privacy1Balance)

  log.debug(
    `Going to withdraw from ResDEX main to ResDEX privacy 1`,
    `current main balance`, balance.toString(),
    `initial main balance`, privacy.initialMainResBalance.toString(),
    `privacy 1 balance`, privacy1Balance.toString(),
    `calculated initial privacy 1 balance`, initialPrivacy1ResBalance.toString(),
  )

  const pollPrivacy2BalanceObservable = getPollPrivacy2BalanceObservable(
    privacy,
    resBaseOrderObservable,
    state$,
    initialPrivacy1ResBalance
  )


  const observable = from(mainApi.withdraw({
    symbol: 'RES',
    address,
    amount: balance.minus(privacy.initialMainResBalance),
  })).pipe(
    switchMap(() => pollPrivacy2BalanceObservable),
    catchError(err => {
      const result = ResDexBuySellActions.createPrivateOrderFailed(
        t(`Error performing Resistance withdrawal to a privatizer address`),
        relResOrderUuid
      )
      log.error(`Can't withdraw from main to Privacy 1 process`, err)
      return of(result)
    })
  )

  return observable
}

const getPollPrivacy2BalanceObservable = (privacy, resBaseOrderObservable, state$, initialPrivacy1ResBalance) => {
  log.debug(`Private market order stage 4, polling the Privacy 2 ResDEX process for RES balance`, privacy)

  const expectedBalance = (
    initialPrivacy1ResBalance
      .minus(Decimal(1))
      .minus(Decimal(300).times(RESDEX.resFee))
  )

  const pollingObservable = interval(1000).pipe(
    map(() => {
      const { balance } = state$.value.resDex.accounts.currencies.RESDEX_PRIVACY2.RES
      log.debug(
        `Polling ResDEX Privacy 2 for RES balance:`,
        balance.toString(),
        `expected balance:`,
        expectedBalance.toString(),
        `initial ResDEX Privacy 1 balance:`,
        initialPrivacy1ResBalance.toString(),
        `initial ResDEX Privacy 2 balance:`,
        privacy.initialPrivacy2ResBalance.toString(),
      )
      return balance
    }),
    filter(
      balance =>
      balance.greaterThan(privacy.initialPrivacy2ResBalance) &&
      balance.greaterThan(expectedBalance)
    ),
    take(1),
    switchMap(() => resBaseOrderObservable),
  )
  return pollingObservable
}

const getResBaseOrderObservable = (privacy, getSuccessObservable, state$, relResOrderUuid) => {
  const { balance } = state$.value.resDex.accounts.currencies.RESDEX_PRIVACY2.RES
  const { orderBook } = state$.value.resDex.buySell
  const { baseCurrency, initialPrivacy2ResBalance } = privacy
  const { price: askPrice } = orderBook.baseRes.asks[0]

  const dexFeeRatio = Decimal(1).minus(RESDEX.dexFee.div(Decimal(100)))

  const orderOptions = {
    baseCurrency,
    quoteCurrency: 'RES',
    quoteCurrencyAmount: balance.minus(initialPrivacy2ResBalance).times(dexFeeRatio),
    price: askPrice.times(Decimal('1.0001')),
  }

  log.debug(`Private market order stage 5, RES -> ${baseCurrency}`, orderOptions)

  return getCreateMarketOrderObservable(
    'RESDEX_PRIVACY2',
    orderOptions,
    privacy,
    getSuccessObservable,
    message => ResDexBuySellActions.createPrivateOrderFailed(message, relResOrderUuid),
    state$
  )
}

const getPollResBaseOrderObservable = (relResOrderUuid, resBaseOrderUuid, state$) => {
  const pollingObservable = interval(1000).pipe(
    map(() => {
      log.debug(`Polling RES base order to complete or fail...`)

      const { swapHistory } = state$.value.resDex.orders
      const order = swapHistory.find(swap => swap.uuid === resBaseOrderUuid)

      if (order) {
        log.debug(`Order status`, order.status)
      } else {
        log.debug(`Order not found`, resBaseOrderUuid)
      }

      return order
    }),
    filter(order => order && ['completed', 'failed'].includes(order.status)),
    take(1),
    map(order => ResDexOrdersActions.setPrivateOrderStatus(relResOrderUuid, order.status)),
  )

  return pollingObservable
}

export function getExpectedBaseCurrencyAmount(state$) {
  const {
    baseCurrency,
    quoteCurrency,
    orderBook
  } = state$.value.resDex.buySell

  const { resDexBuySell: form } = state$.value.roundedForm

  if (!form || !form.fields) {
    return null
  }

  const { maxRel } = form.fields

  if (!maxRel) {
    return null
  }

  const getPrice = (symbol, asks) => {
    if (symbol === 'RES') {
      return Decimal(1)
    }
    if (asks.length) {
      return asks[0].price
    }
    return null
  }

  const baseResPrice = getPrice(baseCurrency, orderBook.baseRes.asks)
  const resQuotePrice = getPrice(quoteCurrency, orderBook.resQuote.asks)

  if (baseResPrice === null || resQuotePrice === null) {
    log.debug(`Can't calculate expected base amount`, String(baseResPrice), String(resQuotePrice))
    return null
  }

  const dexFee = RESDEX.dexFee.dividedBy(Decimal('100'))

  const expectedBaseCurrencyAmount = (
    Decimal(maxRel)
    .dividedBy(resQuotePrice.plus(resQuotePrice.times(dexFee)))
    .dividedBy(baseResPrice)
  )
  return expectedBaseCurrencyAmount
}

function verifyBitcoinAmount(state$, baseAmount) {
    const { baseCurrency } = state$.value.resDex.buySell

    const baseCurrencyAmount = !baseAmount
      ? getExpectedBaseCurrencyAmount(state$) || Decimal(0)
      : baseAmount

    if (baseCurrency === 'BTC' && baseCurrencyAmount.lessThan(Decimal('0.001'))) {
      toastr.warning(t(`The amount, in Bitcoin, you expect to receive cannot be less than 0.001 BTC`))
      return false
    }

    return true
}

function verifyErc20(state$, isPrivate) {
  const { resDex } = state$.value
    const { baseCurrency, quoteCurrency } = resDex.buySell

    if (!getCurrency(baseCurrency).etomic && !getCurrency(quoteCurrency).etomic) {
      return null
    }

    const { balance: mainBalance } = resDex.accounts.currencies.RESDEX.ETH || {}
    const { balance: privacy2Balance } = resDex.accounts.currencies.RESDEX_PRIVACY2.ETH || {}

    if (!mainBalance || !privacy2Balance) {
      toastr.warning(t(`ResDEX is updating balances, please try again later`))
      return of(ResDexBuySellActions.createOrderRejected())
    }

    if (!mainBalance.greaterThanOrEqualTo(Decimal('0.005'))) {
      toastr.error(t(`Before trading with ETH, or ERC-20 tokens, please deposit at least 0.005 ETH into your account.`))
      return of(ResDexBuySellActions.createOrderRejected())
    }

    if (!isPrivate) {
      return null
    }

    log.debug(`ResDEX Privacy 2 ETH balance:`, privacy2Balance.toString())

    if (privacy2Balance.greaterThanOrEqualTo(Decimal('0.005'))) {
      return null
    }

    return of(
      ResDexBuySellActions.createOrderRejected(),
      ResDexAccountsActions.showResdex2DepositModal()
    )
}

const createPrivateOrder = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexBuySellActions.createPrivateOrder),
  switchMap(() => {
    const { currencies } = state$.value.resDex.accounts
    const { baseCurrency, quoteCurrency } = state$.value.resDex.buySell
    const { maxRel } = state$.value.roundedForm.resDexBuySell.fields

    // Calculate expected amount to receive to display in the orders list
    const baseCurrencyAmount = getExpectedBaseCurrencyAmount(state$) || Decimal(0)

    if (!verifyBitcoinAmount(state$, baseCurrencyAmount)) {
      return of(ResDexBuySellActions.createOrderRejected())
    }

    const nextObservable = verifyErc20(state$, true)

    if (nextObservable !== null) {
      return nextObservable
    }

    const privacy = {
      baseCurrency,
      quoteCurrency,
      quoteCurrencyAmount: Decimal(maxRel),
      baseCurrencyAmount,
      initialMainResBalance: currencies.RESDEX.RES.balance,
      initialPrivacy2ResBalance: currencies.RESDEX_PRIVACY2.RES.balance,
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
        of(ResDexOrdersActions.setPrivateOrderStatus(relResOrderUuid, 'swapping_res_base')),
        of(ResDexOrdersActions.linkPrivateOrderToBaseResOrder(relResOrderUuid, resBaseOrderUuid)),
        getPollResBaseOrderObservable(relResOrderUuid, resBaseOrderUuid, state$),
      )
    }

    const resBaseOrderObservable = defer(() => getResBaseOrderObservable(privacy, createResBaseOrderSuccessObservable, state$, relResOrderUuid))

    const withdrawFromMainToPrivacy1Observable = defer(() => (
      merge(
        of(ResDexOrdersActions.setPrivateOrderStatus(relResOrderUuid, 'privatizing')),
        getWithdrawFromMainToPrivacy1Observable(privacy, resBaseOrderObservable, state$, relResOrderUuid),
      )
    ))

    const pollMainProcessBalanceObservable = defer(() => getPollMainProcessBalanceObservable(privacy, withdrawFromMainToPrivacy1Observable, state$))

    const createRelResOrderSuccessObservable = uuid => {
      relResOrderUuid = uuid

      const order: PrivateOrder = {
        ...privacy,
        mainUuid: uuid,
        privacy2Uuid: null,
        status: 'swapping_rel_res',
      }

      return merge(
        pollMainProcessBalanceObservable,
        of(ResDexOrdersActions.savePrivateOrder(order)),
        of(ResDexBuySellActions.createPrivateOrderSucceeded()),
      )
    }

    const relResOrderObservable = getRelResOrderObservable(privacy, createRelResOrderSuccessObservable, state$)

    return relResOrderObservable
  })
)

const createOrderSucceeded = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.createOrderSucceeded),
  map(() => {
    toastr.success(t(`Order created successfully`))
    return ResDexBuySellActions.empty()
  })
)

const createPrivateOrderSucceeded = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.createPrivateOrderSucceeded),
  map(() => {
    toastr.success(t(`Private order created successfully`), t(`New orders creation locked until the trade complete`))
    return ResDexBuySellActions.empty()
  })
)

const createOrderFailed = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.createOrderFailed),
  map(action => {
    toastr.error(t(`Error creating the order`), action.payload.errorMessage)
    return ResDexBuySellActions.empty()
  })
)

const createPrivateOrderFailed = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.createPrivateOrderFailed),
  map(action => {
    const { uuid, errorMessage } = action.payload
    toastr.error(t(`Private order error`), errorMessage)
    if (uuid) {
      return ResDexOrdersActions.setPrivateOrderStatus(uuid, 'failed')
    }
    return ResDexBuySellActions.empty()
  })
)

const selectTab = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.selectTab),
  mapTo(RoundedFormActions.clear('resDexBuySell'))
)

const getOhlc = (action$: ActionsObservable<Action>, state$) => action$.pipe(
  ofType(ResDexBuySellActions.getOhlc),
  switchMap(() => {
    const { baseCurrency, quoteCurrency, period } = state$.value.resDex.buySell

    const periodSeconds = {
      hour: 60 * 60,
      day: 24 * 60 * 60,
      week: 7 * 24 * 60 * 60,
      month: 30 * 24 * 60 * 60,
      year: 365 * 24 * 60 * 60,
    }[period] || 24 * 60 * 60

    const ohlcObservable = from(getMsftOhlcDataPromise()).pipe(
    // const ohlcObservable = from(mainApi.getOhlc(baseCurrency, quoteCurrency, periodSeconds)).pipe(
      map(ohlc => ResDexBuySellActions.gotOhlc({baseCurrency, quoteCurrency}, ohlc)),
      catchError(err => {
        log.error(`Can't get order ticks`, err)
        toastr.error(t(`Error getting price ticks, please check the log for details`))
        return of(ResDexBuySellActions.getOhlcFailed())
      })
    )

    return ohlcObservable
  })
)

const getTrades = (action$: ActionsObservable<Action>, state$) => action$.pipe(
  ofType(ResDexBuySellActions.getTrades),
  switchMap(() => {
    const { baseCurrency, quoteCurrency } = state$.value.resDex.buySell

    const tradesObservable = from(mainApi.getTrades(baseCurrency, quoteCurrency)).pipe(
      map(trades => {
        const updatedTrades = []

        let lastTrade = null

        for (let index = trades.length - 1; index >= 0; index -= 1) {
          let isAscending = true

          const trade = trades[index]

          if (lastTrade) {
            if (lastTrade.price.equals(trade.price)) {
              ({ isAscending } = lastTrade)
            } else {
              isAscending = lastTrade.price.lessThan(trade.price)
            }
          }

          updatedTrades.unshift({
            ...trade,
            isAscending,
          })

          lastTrade = trade
        }

        return ResDexBuySellActions.gotTrades({baseCurrency, quoteCurrency}, updatedTrades)
      }),
      catchError(err => {
        log.error(`Can't get order trades`, err)
        toastr.error(t(`Error getting trades, please check the log for details`))
        return of(ResDexBuySellActions.getTradesFailed())
      })
    )

    return tradesObservable
  })
)

const updateChartPeriod = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.updateChartPeriod),
  mapTo(ResDexBuySellActions.getOhlc()),
)

const cancelIndicatorEdition = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.cancelIndicatorEdition),
  map(action => RoundedFormActions.clear(`resDexBuySellIndicatorsModal-${action.payload.key}`))
)

const removeIndicator = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.removeIndicator),
  map(action => ResDexBuySellActions.cancelIndicatorEdition(action.payload.key))
)

const saveIndicator = (action$: ActionsObservable<Action>, state$) => action$.pipe(
  ofType(ResDexBuySellActions.saveIndicator),
  switchMap(action => {
    const { key } = action.payload

    const { fields } = state$.value.roundedForm[`resDexBuySellIndicatorsModal-${key}`]
    const indicator = {...state$.value.resDex.buySell.tradingChart.indicators[key]}

    log.debug('Fields', fields)

    const findInput = name => indicator.inputs.find(i => i.name === name)
    const findColor = name => indicator.colors.find(i => i.name === name)

    Object.keys(fields).forEach(name => {
      const value = fields[name]
      const input = findInput(name)
      const color = findColor(name)
      if (input) {
        input.value = value
      } else if (color) {
        color.value = value
      }
    })

    return of(
      ResDexBuySellActions.updateIndicator(key, indicator),
      ResDexBuySellActions.cancelIndicatorEdition(key)
    )
  })
)

const updateBaseCurrency = (action$: ActionsObservable<Action>, state$) => action$.pipe(
  ofType(ResDexBuySellActions.updateBaseCurrency, ResDexBuySellActions.updateQuoteCurrency),
  switchMap(() => {
    const { selectedTabIndex } = state$.value.resDex.common
    if (selectedTabIndex === 2) {
      return of(
        ResDexBuySellActions.getOrderBook(),
        ResDexBuySellActions.getOhlc(),
        ResDexBuySellActions.getTrades()
      )
    }
    return of(ResDexBuySellActions.getOrderBook())
  })
)

export const ResDexBuySellEpic = (action$, state$) => merge(
  createOrder(action$, state$),
  createPrivateOrder(action$, state$),
  createOrderSucceeded(action$, state$),
  createPrivateOrderSucceeded(action$, state$),
  createOrderFailed(action$, state$),
  createPrivateOrderFailed(action$, state$),
  getOrderBook(action$, state$),
  getOrderBookFailed(action$, state$),
  selectTab(action$, state$),
  getOhlc(action$, state$),
  getTrades(action$, state$),
  updateChartPeriod(action$, state$),
  cancelIndicatorEdition(action$, state$),
  removeIndicator(action$, state$),
  saveIndicator(action$, state$),
  updateBaseCurrency(action$, state$),
)

