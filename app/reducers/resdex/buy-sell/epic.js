// @flow
import { Decimal } from 'decimal.js'
import log from 'electron-log'
import { of, from, merge, timer } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { RESDEX } from '~/constants/resdex'
import { flattenDecimals } from '~/utils/decimal'
import { SwapDBService } from '~/service/resdex/swap-db'
import { resDexApiFactory } from '~/service/resdex/api'
import { ResDexBuySellActions } from './reducer'


const t = translate('resdex')
const swapDB = new SwapDBService()
const mainApi = resDexApiFactory('RESDEX')

const getOrderBookEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexBuySellActions.getOrderBook),
  switchMap(() => {
    const { baseCurrency, quoteCurrency } = state$.value.resDex.buySell
    const getOrderBookPromise = Promise.all(
      from(mainApi.getOrderBook(baseCurrency, quoteCurrency)),
      from(mainApi.getOrderBook(baseCurrency, 'RES')),
      from(mainApi.getOrderBook(quoteCurrency, 'RES')),
    )
    const observable = from(getOrderBookPromise).pipe(
      switchMap(([baseQuote,  baseRes, quoteRes]) => {
        const orderBook = { baseQuote,  baseRes, quoteRes }
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

const createMarketOrderEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexBuySellActions.createMarketOrder),
  switchMap(() => {
    const { maxRel } = state$.value.roundedForm.resDexBuySell.fields
    const { baseCurrency, quoteCurrency, orderBook } = state$.value.resDex.buySell

    const options = {
      baseCurrency,
      quoteCurrency,
      quoteAmount: maxRel,
      price: orderBook.baseQuote.asks[0]
    }

    return getCreateMarketOrderObservable(
      options,
      of(ResDexBuySellActions.createMarketOrderSucceeded()),
      ResDexBuySellActions.createMarketOrderFailed,
      state$
    )
  })
)

const getCreateMarketOrderObservable = (processName, options, successObservable, failureAction, state$) => {
  const {
    baseCurrency,
    quoteCurrency,
    quoteAmount,
    price
  } = options

  const api = resDexApiFactory(processName)
  const txFee = state$.value.resDex.accounts.currencyFees[quoteCurrency]

  const dexFee = RESDEX.dexFee.div(Decimal('100'))
  const divider = price.plus(price.times(dexFee)).plus(txFee).plus(txFee)

  const requestOpts = {
    type: 'buy',
    baseCurrency,
    quoteCurrency,
    price: divider,
    amount: Decimal(quoteAmount).dividedBy(price).toDP(8, Decimal.ROUND_FLOOR),
    total: Decimal(quoteAmount).toDP(8, Decimal.ROUND_FLOOR)
  }

  log.debug(`Submitting a swap`, requestOpts)

  const orderObservable = from(api.createMarketOrder(requestOpts)).pipe(
    switchMap(result => {
      if (!result.pending) {
        const message = t(`Something unexpected happened. Are you sure you have enough UTXO?`)
        return of(failureAction(message))
      }

      const swap = result.pending
      const flattenedOptions = flattenDecimals(requestOpts)
      log.debug(`Inserting a swap`, result.swaps, swap, flattenedOptions)
      swapDB.insertSwapData(swap, flattenedOptions)

      return successObservable
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

const getRelResOrderObservable = (options, pollMainProcessBalanceObservable, state$) => {
    const { quoteCurrency, orderBook } = state$.value.resDex.buySell
    const { quoteAmount } = options

    const orderOptions = {
      baseCurrency: 'RES',
      quoteCurrency,
      quoteAmount,
      price: orderBook.quoteRes.asks[0]
    }

    log.debug(`Private market order stage 1, ${quoteCurrency} -> RES`, orderOptions)

    return getCreateMarketOrderObservable(
      'RESDEX',
      orderOptions,
      pollMainProcessBalanceObservable,
      ResDexBuySellActions.createPrivateMarketOrderFailed,
      state$
    )

}

const getPollMainProcessBalanceObservable = (options, withdrawFromMainToPrivacy1Observable, state$) => {
  const pollingObservable = timer(0, 1000).pipe(
    switchMap(() => {
      log.debug(`Private market order stage 2, polling the main ResDEX process for RES balance`, options)

      const balance = state$.value.resDex.accounts.currencies.RES
      if (balance.greaterThan(options.initialMainResBalance)) {
        return withdrawFromMainToPrivacy1Observable
      }
      return ResDexBuySellActions.empty()
    })
  )
  return pollingObservable
}

const getWithdrawFromMainToPrivacy1Observable = (options, pollPrivacy2BalanceObservable, state$) => {
  const { currencies } = state$.value.resDex.accounts
  const { address } = currencies.PRIVACY1.RES
  const { balance } = currencies.RESDEX.RES

  log.debug(`Private market order stage 3, withdrawing from the main ResDEX process to Privacy 1`, options)

  const observable = from(mainApi.withdraw({
    symbol: 'RES',
    address,
    amount: balance.minus(options.initialMainResBalance),
  })).pipe(
    switchMap(() => pollPrivacy2BalanceObservable),
    catchError(err => {
      log.error(`Can't withdraw from main to Privacy 1 process`, err)
      return ResDexBuySellActions.createPrivateMarketOrderFailed(t(`Error performing Resistance withdrawal to a privatizer address`))
    })
  )

  return observable
}

const getPollPrivacy2BalanceObservable = (options, relBaseOrderObservable, state$) => {
  const pollingObservable = timer(0, 1000).pipe(
    switchMap(() => {
      log.debug(`Private market order stage 4, polling the Privacy 2 ResDEX process for RES balance`, options)

      const balance = state$.value.resDex.accounts.currencies.PRIVACY2.RES
      if (balance.greaterThan(options.initialMainResBalance)) {
        return relBaseOrderObservable
      }
      return ResDexBuySellActions.empty()
    })
  )
  return pollingObservable
}

const getResBaseOrderObservable = (options, state$) => {
  const { balance } = state$.value.resDex.accounts.currencies.PRIVACY2
  const { orderBook } = state$.value.resDex.buySell
  const { baseCurrency, initialPrivacy2ResBalance } = options

  const orderOptions = {
    baseCurrency,
    quoteCurrency: 'RES',
    quoteAmount: balance.minus(initialPrivacy2ResBalance),
    price: orderBook.baseRes.asks[0]
  }

  log.debug(`Private market order stage 5, RES -> ${baseCurrency}`, orderOptions)

  return getCreateMarketOrderObservable(
    'RESDEX_PRIVACY2',
    orderOptions,
    of(ResDexBuySellActions.empty),
    ResDexBuySellActions.createPrivateMarketOrderFailed,
    state$
  )
}

const createPrivateOrderEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexBuySellActions.createPrivateMarketOrder),
  switchMap(() => {
    const { currencies } = state$.value.resDex.accounts
    const { baseCurrency, quoteCurrency } = state$.value.resDex.buySell
    const { maxRel } = state$.value.roundedForm.resDexBuySell.fields

    const options = {
      baseCurrency,
      quoteCurrency,
      quoteAmount: maxRel,
      initialMainResBalance: currencies.RESDEX.RES,
      initialPrivacy2ResBalance: currencies.PRIVACY2.RES,
    }

    // 1. Create order Rel -> RES on process1
    // 2. Poll for the process1 RES balance
    // 3. Withdraw from process1 to process2
    // 4. Poll for process3 balance
    // 5. Create order RES -> Base on process3

    const resBaseOrderObservable = getResBaseOrderObservable(options, state$)
    const pollPrivacy2BalanceObservable = getPollPrivacy2BalanceObservable(options, resBaseOrderObservable, state$)

    const withdrawFromMainToPrivacy1Observable = getWithdrawFromMainToPrivacy1Observable(options, pollPrivacy2BalanceObservable, state$)
    const pollMainProcessBalanceObservable = getPollMainProcessBalanceObservable(options, withdrawFromMainToPrivacy1Observable, state$)

    const relResOrderObservable = getRelResOrderObservable(pollMainProcessBalanceObservable, state$)

    return relResOrderObservable
  })
)

const createMarketOrderSucceededEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.createMarketOrderSucceeded),
  map(() => {
    toastr.success(t(`Market order created successfully`))
    return ResDexBuySellActions.empty()
  })
)

const createMarketOrderFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.createMarketOrderFailed),
  map(action => {
    toastr.error(t(`Error creating a market order`), action.payload.errorMessage)
    return ResDexBuySellActions.empty()
  })
)

export const ResDexBuySellEpic = (action$, state$) => merge(
  createMarketOrderEpic(action$, state$),
  createPrivateOrderEpic(action$, state$),
  createMarketOrderSucceededEpic(action$, state$),
  createMarketOrderFailedEpic(action$, state$),
  getOrderBookEpic(action$, state$),
  getOrderBookFailedEpic(action$, state$),
)

