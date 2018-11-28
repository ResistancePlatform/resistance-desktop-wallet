// @flow
import { Decimal } from 'decimal.js'
import log from 'electron-log'
import { of, from, merge, interval, defer } from 'rxjs'
import { map, take, filter, switchMap, catchError } from 'rxjs/operators'
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
      () => of(ResDexBuySellActions.createMarketOrderSucceeded()),
      ResDexBuySellActions.createMarketOrderFailed,
      state$
    )
  })
)

const getCreateOrderObservable = (processName, options, privacy, getSuccessObservable, failureAction, state$) => {
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

      return getSuccessObservable(swap.uuid)
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

const getRelResOrderObservable = (privacy, getSuccessObservable, state$) => {
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
    amount: Decimal(10), // balance.minus(privacy.initialMainResBalance),
  })).pipe(
    switchMap(() => pollPrivacy2BalanceObservable),
    catchError(err => {
      log.error(`Can't withdraw from main to Privacy 1 process`, JSON.stringify(err))
      return ResDexBuySellActions.createPrivateOrderFailed(t(`Error performing Resistance withdrawal to a privatizer address`))
    })
  )

  return observable
}

const getPollPrivacy2BalanceObservable = (privacy, relBaseOrderObservable, state$) => {
  log.debug(`Private market order stage 4, polling the Privacy 2 ResDEX process for RES balance`, privacy)

  const pollingObservable = interval(1000).pipe(
    map(() => {
      const { balance } = state$.value.resDex.accounts.currencies.RESDEX_PRIVACY2.RES
      log.debug(`Polling ResDEX Privacy 2 for RES balance:`, balance.toString())
      return balance
    }),
    filter(balance => balance.greaterThan(privacy.initialMainResBalance)),
    take(1),
    switchMap(() => relBaseOrderObservable),
  )
  return pollingObservable
}

const getResBaseOrderObservable = (privacy, getSuccessObservable, state$) => {
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
    getSuccessObservable,
    ResDexBuySellActions.createPrivateOrderFailed,
    state$
  )
}

const getPollResBaseOrderObservable = (uuid, state$) => {
  const pollingObservable = interval(1000).pipe(
    map(() => {
      log.debug(`Polling RES base order to complete or fail...`)
      const { swapHistory } = state$.value.resDex.orders
      return swapHistory.filter(swap => swap.uuid === uuid).pop()
    }),
    filter(order => order && ['completed', 'failed'].includes(order.status)),
    take(1),
    map(order => ResDexBuySellActions.setPrivateOrderStatus(uuid, order.status)),
  )

  return pollingObservable
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

    let relResOrderUuid
    let resBaseOrderUuid

    const createResBaseOrderSuccessObservable = uuid => {
      resBaseOrderUuid = uuid

      return merge(
        of(ResDexBuySellActions.setPrivateOrderStatus(resBaseOrderUuid , 'swapping_res_base')),
        getPollResBaseOrderObservable(privacy, state$),
      )
    }

    const resBaseOrderObservable = defer(() => getResBaseOrderObservable(privacy, createResBaseOrderSuccessObservable, state$))
    const pollPrivacy2BalanceObservable = defer(() => getPollPrivacy2BalanceObservable(privacy, resBaseOrderObservable, state$))

    const withdrawFromMainToPrivacy1Observable = defer(() => merge(
      // of(ResDexBuySellActions.setPrivateOrderStatus(relResOrderUuid, 'privatizing')),
      getWithdrawFromMainToPrivacy1Observable(privacy, pollPrivacy2BalanceObservable, state$),
    ))

    return withdrawFromMainToPrivacy1Observable

    // const pollMainProcessBalanceObservable = defer(() => getPollMainProcessBalanceObservable(privacy, withdrawFromMainToPrivacy1Observable, state$))
    //
    // const createRelResOrderSuccessObservable = uuid => {
    //   relResOrderUuid = uuid
    //
    //   return merge(
    //     pollMainProcessBalanceObservable,
    //     of(ResDexBuySellActions.setPrivateOrderStatus(uuid, 'swapping_rel_res')),
    //     of(ResDexBuySellActions.createPrivateOrderSucceeded()),
    //   )
    // }
    //
    // const relResOrderObservable = getRelResOrderObservable(privacy, createRelResOrderSuccessObservable, state$)
    //
    // return relResOrderObservable
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

