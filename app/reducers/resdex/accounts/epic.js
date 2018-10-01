// @flow
import { Decimal } from 'decimal.js'
import { of, from, merge } from 'rxjs'
import { ofType } from 'redux-observable'
import { switchMap, map, catchError } from 'rxjs/operators'
import { actions as toastrActions } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { ResDexApiService } from '~/service/resdex/api'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'


const t = translate('resdex')
const api = new ResDexApiService()


const getCurrenciesEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexAccountsActions.getCurrencies),
  switchMap(() => (
    from(api.getPortfolio()).pipe(
      switchMap(response => {
        const currencies = response.portfolio.reduce((accumulator, currency) => ({
          ...accumulator,
          [currency.coin]: {
            symbol: currency.coin,
            address: currency.address,
            balance: Decimal(currency.balance),
            price: Decimal(currency.price),
            amount: Decimal(currency.amount),
          }
        }), {})

        return of(ResDexAccountsActions.gotCurrencies(currencies))
      }),
      catchError(err => of(ResDexAccountsActions.getCurrenciesFailed(err.message)))
    )
  ))
)

const getCurrenciesFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexAccountsActions.getCurrenciesFailed),
  map(action => (toastrActions.add({
    type: 'error',
    title: t(`Error getting currencies from ResDEX`),
    message: action.payload.errorMessage
  })))
)

export const ResDexAccountsEpic = (action$, state$) => merge(
  getCurrenciesEpic(action$, state$),
  getCurrenciesFailedEpic(action$, state$),
)

