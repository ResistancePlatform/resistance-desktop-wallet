// @flow
import pMap from 'p-map'
import log from 'electron-log'
import config from 'electron-settings'
import { Decimal } from 'decimal.js'
import { of, from, defer, concat, merge } from 'rxjs'
import { ofType } from 'redux-observable'
import { switchMap, map, catchError } from 'rxjs/operators'
import { actions as toastrActions } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { getCurrencyName } from '~/utils/resdex'
import { ResDexApiService } from '~/service/resdex/api'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'


const t = translate('resdex')
const api = new ResDexApiService()


const enableCurrenciesEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexAccountsActions.enableCurrencies),
  switchMap(() => {
    const { enabledCurrencies } = state$.value.resDex.accounts

    const symbols = enabledCurrencies.map(currency => currency.symbol)

    const enableCurrenciesPromise = Promise.all(symbols.map(symbol => api.enableCurrency(symbol)))
    const getFeesPromise = Promise.all(symbols.map(symbol => api.getFee(symbol)))
    const getConfirmationsPromise = () => Promise.all(symbols.map(symbol => api.setConfirmationsNumber(symbol, 0)))

    const setConfirmationsObservable = defer(() => from(getConfirmationsPromise())).pipe(
      switchMap(() => {
        log.info(`Confirmations number set to 0 for all the currencies`)
        return of(ResDexAccountsActions.empty())
      }),
      catchError(err => {
        log.error(`Failed to set zero confirmations number`, err)
        return of(ResDexAccountsActions.empty())
      })
    )

    const getFeesObservable = from(getFeesPromise).pipe(
      switchMap(fees => {
        const feesMap = fees.reduce((previous, fee, index) =>(
          { ...previous, [symbols[index]]: fee }
        ), {})
        return of(ResDexAccountsActions.gotCurrencyFees(feesMap))
      }),
      catchError(err => {
        log.error(`Failed to get currencies fees`, err)

        return of(toastrActions.add({
          type: 'error',
          title: t(`Error getting currencies fees`),
        }))
      })
    )

    const enableCurrenciesObservable = from(enableCurrenciesPromise).pipe(
      switchMap(() => concat(getFeesObservable, setConfirmationsObservable)),
      catchError(err => of(toastrActions.add({
        type: 'error',
        title: t(`Error enabling currencies`),
        message: err.message,
      })))
    )

    return enableCurrenciesObservable
  })
)

const getCurrenciesEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexAccountsActions.getCurrencies),
  switchMap(() => (
    from(api.getPortfolio()).pipe(
      switchMap(response => {
        const { currencies: previousCurrencies } = state$.value.resDex.accounts

        const currencies = response.portfolio.reduce((accumulator, currency) => ({
          ...accumulator,
          [currency.coin]: {
            symbol: currency.coin,
            name: getCurrencyName(currency.coin),
            address: currency.address,
            balance: Decimal(currency.balance),
            price: Decimal(currency.price),
            amount: Decimal(currency.amount),
          }
        }), {})

        const actions = [ResDexAccountsActions.gotCurrencies(currencies)]

        if (Object.keys(previousCurrencies).length === 0) {
          actions.push(ResDexAccountsActions.getTransactions())
        }

        return of(...actions)
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


const getTransactionsEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexAccountsActions.getTransactions),
  switchMap(() => {
    const { currencies, enabledCurrencies } = state$.value.resDex.accounts

    if (Object.keys(currencies).length === 0) {
      log.warn(`Portfolio hasn't been fetched yet, can't get transactions history.`)
      return of(ResDexAccountsActions.gotTransactions({}))
    }

    const symbols = enabledCurrencies.map(currency => currency.symbol)

    const listTransactionsPromise = pMap(
      symbols,
      symbol => api.listTransactions(symbol, currencies[symbol].address),
      { concurrency: 1 }
    )

    return from(listTransactionsPromise).pipe(
      switchMap(results => {
        const currencyTransactions = results.reduce((accumulator, transaction, index) => (
          { ...accumulator, [symbols[index]]: transaction }
        ), {})
        return of(ResDexAccountsActions.gotTransactions(currencyTransactions))
      }),
      catchError(err => {
        log.error(`Error getting transactions from ResDEX`, err)
        return of(
          ResDexAccountsActions.getTransactionsFailed(err.message),
          toastrActions.add({
            type: 'error',
            title: t(`Unable to get transactions from ResDEX, check the application log for details`),
          })
        )
      })
    )
  })
)

const addCurrencyEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(ResDexAccountsActions.addCurrency),
  switchMap(() => {
    const enabledCurrencies = state$.value.resDex.accounts.enabledCurrencies.slice()
    const { fields } = state$.value.roundedForm.resDexAccountsAddCurrencyModal

    enabledCurrencies.push(fields)

    enabledCurrencies.sort(
      (currency1, currency2) => currency1.symbol.localeCompare(currency2.symbol)
    )

    config.set('resDex.enabledCurrencies', enabledCurrencies)

    return of(
      ResDexAccountsActions.updateEnabledCurrencies(enabledCurrencies),
      toastrActions.add({
        type: 'success',
        title: t(`Currency {{currency}} ({{symbol}}) has been added`, {
          currency: getCurrencyName(fields.symbol),
          symbol: fields.symbol
        }),
      }),
      ResDexAccountsActions.getCurrencies(),
      ResDexAccountsActions.closeAddCurrencyModal(),
    )
  })
)

export const ResDexAccountsEpic = (action$, state$) => merge(
  enableCurrenciesEpic(action$, state$),
  getCurrenciesEpic(action$, state$),
  getCurrenciesFailedEpic(action$, state$),
  getTransactionsEpic(action$, state$),
  addCurrencyEpic(action$, state$),
)

