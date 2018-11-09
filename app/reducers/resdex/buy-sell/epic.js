// @flow
import { Decimal } from 'decimal.js'
import log from 'electron-log'
import { of, from, merge } from 'rxjs'
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
const transparentApi = resDexApiFactory('RESDEX')

const getOrderBookEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexBuySellActions.getOrderBook),
  switchMap(() => {
    const { baseCurrency, quoteCurrency } = state$.value.resDex.buySell
    const observable = from(transparentApi.getOrderBook(baseCurrency, quoteCurrency)).pipe(
      switchMap(orderBook => of(ResDexBuySellActions.gotOrderBook(orderBook))),
      catchError(err => of(ResDexBuySellActions.getOrderBookFailed(err.toString())))
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
	ofType(ResDexBuySellActions.createMarketOrder),
  switchMap(() => {
		const { maxRel } = state$.value.roundedForm.resDexBuySell.fields
    const { baseCurrency, quoteCurrency, orderBook } = state$.value.resDex.buySell

    const txFee = state$.value.resDex.accounts.currencyFees[quoteCurrency]
    const { price } = orderBook.asks[0]

    const dexFee = RESDEX.dexFee.div(Decimal('100'))
    const divider = price.plus(price.times(dexFee)).plus(txFee).plus(txFee)

		const requestOpts = {
			type: 'buy',
			baseCurrency,
			quoteCurrency,
      price: divider,
			amount: Decimal(maxRel).dividedBy(price).toDP(8, Decimal.ROUND_FLOOR),
			total: Decimal(maxRel).toDP(8, Decimal.ROUND_FLOOR)
		}

    log.debug(`Submitting a swap`, requestOpts)

    const orderObservable = from(transparentApi.createMarketOrder(requestOpts)).pipe(
      switchMap(result => {
        if (!result.pending) {
          const message = t(`Something unexpected happened. Are you sure you have enough UTXO?`)
          return of(ResDexBuySellActions.createMarketOrderFailed(message))
        }

        const swap = result.pending
        const flattenedOptions = flattenDecimals(requestOpts)
        log.debug(`Inserting a swap`, result.swaps, swap, flattenedOptions)
        swapDB.insertSwapData(swap, flattenedOptions)

        return of(ResDexBuySellActions.createMarketOrderSucceeded())
      }),
      catchError(err => {
        let { message } = err
        log.error(`Swap error`, err)

        if (message === 'only one pending request at a time') {
          message = t(`Only one pending swap at a time, try again in {{wait}} seconds.`, { wait: err.response.wait})
        }

        return of(ResDexBuySellActions.createMarketOrderFailed(message))
      })
    )

    return orderObservable
  })
)

const createPrivateOrderEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexBuySellActions.createPrivateMarketOrder),
  switchMap(() => {
    // 1. Create order Rel -> RES on process1
    // 2. Poll for the process1 RES balance
    // 3. Withdraw from process1 to process2
    // 4. Poll for process3 balance
    // 5. Create order RES -> Base on process3

    // const relBaseOrderObservable = of()
    // const pollPrivacy3BalanceObservable = of()
    // const withdrawFromMainToPrivacy1Observable = of()
    // const pollMainProcessBalanceObservable = of()

    // const relResOrderObservable = getRelResOrderObservable(pollMainProcessBalanceObservable, action$, state$)

    return null
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
  createOrderEpic(action$, state$),
  createMarketOrderSucceededEpic(action$, state$),
  createMarketOrderFailedEpic(action$, state$),
  getOrderBookEpic(action$, state$),
  getOrderBookFailedEpic(action$, state$),
)

