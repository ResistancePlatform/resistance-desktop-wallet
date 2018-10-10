// @flow
import log from 'electron-log'
import { of, from, merge } from 'rxjs'
import { map, switchMap, catchError } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { actions as toastrActions } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { ResDexApiService } from '~/service/resdex/api'
import { ResDexBuySellActions } from './reducer'


const t = translate('resdex')
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
  map(action => {
    log.debug(action.payload)
      return toastrActions.add({
        type: 'error',
        title: t(`Error getting the order book`),
        message: action.payload.errorMessage,
      })
  })
)

const createOrderEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexBuySellActions.createMarketOrder),
  switchMap(() => {
    const { baseCurrency, quoteCurrency, orderBook } = state$.value.resDex.buySell
    const fields = state$.value.roundedForm.resDexBuySell.fields
		const { sendFrom, receiveTo, maxAmount } = fields

		const requestOpts = {
			type: 'buy',
			baseCurrency,
			quoteCurrency,
			price: Number(price),
			amount: Number(amount),
			total: Number(total),
		}

		const result = await api.order(requestOpts)

		const orderError = error => {
			// eslint-disable-next-line no-new
			new Notification(t('order.failedTrade', {baseCurrency, type}), {body: error})
			exchangeContainer.setIsSendingOrder(false)
			this.setState({hasError: true})
		}

		// TODO: If we get this error we should probably show a more helpful error
		// and grey out the order form for result.wait seconds.
		// Or alternatively if we know there is a pending trade, prevent them from
		// placing an order until it's matched.
		if (result.error) {
			let {error} = result
			if (error === 'only one pending request at a time') {
				error = t('order.maxOnePendingSwap', {wait: result.wait})
			}
			orderError(error)
			return
		}

		// TODO: Temp workaround for marketmaker issue
		if (!result.pending) {
			orderError(t('order.unexpectedError'))
			return
		}

		const swap = result.pending
		const {swapDB} = appContainer
		await swapDB.insertSwapData(swap, requestOpts)
		exchangeContainer.setIsSendingOrder(false)
  })
)

export const ResDexBuySellEpic = (action$, state$) => merge(
  createOrderEpic(action$, state$),
  getOrderBookEpic(action$, state$),
  getOrderBookFailedEpic(action$, state$),
)

