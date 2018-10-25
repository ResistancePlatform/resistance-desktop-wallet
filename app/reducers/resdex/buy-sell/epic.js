// @flow
import { Decimal } from 'decimal.js'
import log from 'electron-log'
import { of, from, merge } from 'rxjs'
import { switchMap, catchError } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { actions as toastrActions } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { RESDEX } from '~/constants/resdex'
import { flattenDecimals } from '~/utils/decimal'
import { SwapDBService } from '~/service/resdex/swap-db'
import { ResDexApiService } from '~/service/resdex/api'
import { ResDexBuySellActions } from './reducer'


const t = translate('resdex')
const swapDB = new SwapDBService()
const api = new ResDexApiService()

const getOrderBookEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexBuySellActions.getOrderBook),
  switchMap(() => {
    const { baseCurrency, quoteCurrency } = state$.value.resDex.buySell
    const observable = from(api.getOrderBook(baseCurrency, quoteCurrency)).pipe(
      switchMap(orderBook => of(ResDexBuySellActions.gotOrderBook(orderBook))),
      catchError(err => of(ResDexBuySellActions.getOrderBookFailed(err.toString())))
    )

    return observable
  })
)

const getOrderBookFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.getOrderBookFailed),
  switchMap(action => of(
    toastrActions.add({
      type: 'error',
      title: t(`Error getting the order book`),
      message: action.payload.errorMessage,
    }),
    ResDexBuySellActions.empty()
  ))
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
      price: divider,  // .dividedBy(Decimal(2)),
			amount: Decimal(maxRel).dividedBy(price).toDP(8, Decimal.ROUND_FLOOR),
			total: Decimal(maxRel).toDP(8, Decimal.ROUND_FLOOR)
		}

    log.debug(`Submitting a swap`, requestOpts)

    const orderObservable = from(api.createMarketOrder(requestOpts)).pipe(
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

const createMarketOrderSucceededEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.createMarketOrderSucceeded),
  switchMap(() => of(
    toastrActions.add({
      type: 'success',
      title: t(`Market order created successfully`),
    }),
    ResDexBuySellActions.empty()
  ))
)

const createMarketOrderFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.createMarketOrderFailed),
  switchMap(action => of(
    toastrActions.add({
      type: 'error',
      title: t(`Error creating a market order`),
      message: action.payload.errorMessage,
    }),
    ResDexBuySellActions.empty()
  ))
)

export const ResDexBuySellEpic = (action$, state$) => merge(
  createOrderEpic(action$, state$),
  createMarketOrderSucceededEpic(action$, state$),
  createMarketOrderFailedEpic(action$, state$),
  getOrderBookEpic(action$, state$),
  getOrderBookFailedEpic(action$, state$),
)

