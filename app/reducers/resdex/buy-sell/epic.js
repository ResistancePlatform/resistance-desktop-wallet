// @flow
import { Decimal } from 'decimal.js'
import log from 'electron-log'
import { of, from, merge, timer, defer } from 'rxjs'
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
    const { price } = orderBook.baseQuote.asks[0]

    const options = {
      baseCurrency,
      quoteCurrency,
      quoteAmount: maxRel,
      price,
    }

    return getCreateOrderObservable(
      options,
      null,
      of(ResDexBuySellActions.createMarketOrderSucceeded()),
      ResDexBuySellActions.createMarketOrderFailed,
      state$
    )
  })
)

const getCreateOrderObservable = (processName, options, privacy, successObservable, failureAction, state$) => {
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
      swapDB.insertSwapData(swap, flattenedOptions, flattenDecimals(privacy))

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

const getRelResOrderObservable = (privacy, pollMainProcessBalanceObservable, state$) => {
    const { quoteCurrency, orderBook } = state$.value.resDex.buySell
    const { quoteAmount } = privacy
    const { price } = orderBook.resQuote.asks[0]

    const orderOptions = {
      baseCurrency: 'RES',
      quoteCurrency,
      quoteAmount,
      price,
    }
    log.debug(`Private market order stage 1, ${quoteCurrency} -> RES`, orderOptions)

    return getCreateOrderObservable(
      'RESDEX',
      orderOptions,
      privacy,
      pollMainProcessBalanceObservable,
      ResDexBuySellActions.createPrivateOrderFailed,
      state$
    )

}

const getPollMainProcessBalanceObservable = (privacy, withdrawFromMainToPrivacy1Observable, state$) => {
  log.debug(`Private market order stage 2, polling the main ResDEX process for RES balance`, privacy)

  const pollingObservable = timer(0, 1000).pipe(
    switchMap(() => {
      const { balance } = state$.value.resDex.accounts.currencies.RESDEX.RES
      log.debug(`Private market order stage 2`, balance)

      if (balance.greaterThan(privacy.initialMainResBalance)) {
        return withdrawFromMainToPrivacy1Observable
      }
      return of(ResDexBuySellActions.empty())
    })
  )
  return pollingObservable
}

const getWithdrawFromMainToPrivacy1Observable = (privacy, pollPrivacy2BalanceObservable, state$) => {
  const { currencies } = state$.value.resDex.accounts
  const { address } = currencies.RESDEX_PRIVACY1.RES
  const { balance } = currencies.RESDEX.RES

  log.debug(`Private market order stage 3, withdrawing from the main ResDEX process to Privacy 1`, privacy)

  const observable = from(mainApi.withdraw({
    symbol: 'RES',
    address,
    amount: balance.minus(privacy.initialMainResBalance),
  })).pipe(
    switchMap(() => pollPrivacy2BalanceObservable),
    catchError(err => {
      log.error(`Can't withdraw from main to Privacy 1 process`, err)
      return ResDexBuySellActions.createPrivateOrderFailed(t(`Error performing Resistance withdrawal to a privatizer address`))
    })
  )

  return observable
}

const getPollPrivacy2BalanceObservable = (privacy, relBaseOrderObservable, state$) => {
  const pollingObservable = timer(0, 1000).pipe(
    switchMap(() => {
      log.debug(`Private market order stage 4, polling the Privacy 2 ResDEX process for RES balance`, privacy)

      const { balance } = state$.value.resDex.accounts.currencies.RESDEX_PRIVACY2.RES
      if (balance.greaterThan(privacy.initialMainResBalance)) {
        return relBaseOrderObservable
      }
      return ResDexBuySellActions.empty()
    })
  )
  return pollingObservable
}

const getResBaseOrderObservable = (privacy, state$) => {
  const { balance } = state$.value.resDex.accounts.currencies.RESDEX_PRIVACY2.RES
  const { orderBook } = state$.value.resDex.buySell
  const { baseCurrency, initialPrivacy2ResBalance } = privacy
  const { price } = orderBook.baseRes.asks[0]

  const orderOptions = {
    baseCurrency,
    quoteCurrency: 'RES',
    quoteAmount: balance.minus(initialPrivacy2ResBalance),
    price,
  }

  log.debug(`Private market order stage 5, RES -> ${baseCurrency}`, orderOptions)

  return getCreateOrderObservable(
    'RESDEX_PRIVACY2',
    orderOptions,
    privacy,
    of(ResDexBuySellActions.empty),
    ResDexBuySellActions.createPrivateOrderFailed,
    state$
  )
}

const createPrivateOrderEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexBuySellActions.createPrivateOrder),
  switchMap(() => {
    const { currencies } = state$.value.resDex.accounts
    const { baseCurrency, quoteCurrency } = state$.value.resDex.buySell
    const { maxRel } = state$.value.roundedForm.resDexBuySell.fields

    const privacy = {
      baseCurrency,
      quoteCurrency,
      quoteAmount: maxRel,
      initialMainResBalance: currencies.RESDEX.RES.balance,
      initialPrivacy2ResBalance: currencies.RESDEX_PRIVACY2.RES.balance,
    }

    // 1. Create order Rel -> RES on process1
    // 2. Poll for the process1 RES balance
    // 3. Withdraw from process1 to process2
    // 4. Poll for process3 balance
    // 5. Create order RES -> Base on process3

    const resBaseOrderObservable = defer(() => getResBaseOrderObservable(privacy, state$))
    const pollPrivacy2BalanceObservable = defer(() => getPollPrivacy2BalanceObservable(privacy, resBaseOrderObservable, state$))

    const withdrawFromMainToPrivacy1Observable = defer(() => getWithdrawFromMainToPrivacy1Observable(privacy, pollPrivacy2BalanceObservable, state$))
    const pollMainProcessBalanceObservable = defer(() => getPollMainProcessBalanceObservable(privacy, withdrawFromMainToPrivacy1Observable, state$))

    const createOrderSuccessObservable = merge(pollMainProcessBalanceObservable, of(ResDexBuySellActions.createPrivateOrderSucceeded()))
    const relResOrderObservable = getRelResOrderObservable(privacy, createOrderSuccessObservable, state$)

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

const createPrivateOrderSucceededEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.createPrivateOrderSucceeded),
  map(() => {
    toastr.success(t(`Private order created successfully`))
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

const setPrivateOrderStatusEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.setPrivateOrderStatus),
  map(action => {
    swapDB.updateSwapData({
      uuid: action.payload.uuid,
      method: 'set_private_order_status',
      status: action.payload.status,
    })
    return ResDexBuySellActions.empty()
  })
)

export const ResDexBuySellEpic = (action$, state$) => merge(
  createMarketOrderEpic(action$, state$),
  createPrivateOrderEpic(action$, state$),
  createMarketOrderSucceededEpic(action$, state$),
  createPrivateOrderSucceededEpic(action$, state$),
  createMarketOrderFailedEpic(action$, state$),
  getOrderBookEpic(action$, state$),
  getOrderBookFailedEpic(action$, state$),
  setPrivateOrderStatusEpic(action$, state$),
)

