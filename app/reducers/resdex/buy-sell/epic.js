// @flow
import { Decimal } from 'decimal.js'
import log from 'electron-log'
import { of, from, merge } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { actions as toastrActions } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
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
  map(action => (
    toastrActions.add({
      type: 'error',
      title: t(`Error getting the order book`),
      message: action.payload.errorMessage,
    })
  ))
)

const createOrderEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexBuySellActions.createMarketOrder),
  switchMap(() => {
		const { sendFrom, receiveTo, maxRel } = state$.value.roundedForm.resDexBuySell.fields
    const { orderBook } = state$.value.resDex.buySell

    const { price } = orderBook.asks[0]

		const requestOpts = {
			type: 'buy',
			baseCurrency: receiveTo,
			quoteCurrency: sendFrom,
			price,
			amount: Decimal(maxRel).div(price),
			total: Decimal(maxRel)
		}

    log.debug(`Submitting a swap`, requestOpts)

    const orderObservable = from(api.createMarketOrder(requestOpts)).pipe(
      switchMap(result => {
        if (!result.pending) {
          const message = t(`Something unexpected happened. Are you sure you have enough UTXO?`)
          return of(ResDexBuySellActions.createMarketOrderFailed(message))
        }

        const swap = result.pending
        swapDB.insertSwapData(swap, requestOpts)

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
  map(() => (
    toastrActions.add({
      type: 'success',
      title: t(`Market order created successfully`),
    })
  ))
)

const createMarketOrderFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexBuySellActions.createMarketOrderFailed),
  map(action => (
    toastrActions.add({
      type: 'error',
      title: t(`Error creating a market order`),
      message: action.payload.errorMessage,
    })
  ))
)

export const ResDexBuySellEpic = (action$, state$) => merge(
  createOrderEpic(action$, state$),
  createMarketOrderSucceededEpic(action$, state$),
  createMarketOrderFailedEpic(action$, state$),
  getOrderBookEpic(action$, state$),
  getOrderBookFailedEpic(action$, state$),
)

