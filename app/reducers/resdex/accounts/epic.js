// @flow
import { clipboard } from 'electron'
import log from 'electron-log'
import config from 'electron-settings'
import { Decimal } from 'decimal.js'
import { Observable, of, from, defer, concat, merge } from 'rxjs'
import { ofType } from 'redux-observable'
import { switchMap, map, catchError, mergeMap, mergeAll } from 'rxjs/operators'
import { toastr, actions as toastrActions } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { getSortedCurrencies, getCurrencyName } from '~/utils/resdex'
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
      return of(ResDexAccountsActions.gotCurrencyTransactions('RES', null))
    }

    const observables = getSortedCurrencies(enabledCurrencies).map(currency => {
      const { symbol } = currency

      const observable = from(api.listTransactions(symbol, currencies[symbol].address)).pipe(
        switchMap(transactions => {
          log.debug(`Got ${transactions.length} transactions for ${symbol}`)
          return of(ResDexAccountsActions.gotCurrencyTransactions(symbol, transactions.reverse()))
        }),
        catchError(err => {
          log.error(`Can't get transactions for ${symbol}: `, err)
          return of(ResDexAccountsActions.getTransactionsFailed(err.message))
        })
      )

      return observable
    })

    return concat(...observables)

  })
)

const addCurrencyEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(ResDexAccountsActions.addCurrency),
  switchMap(() => {
    const enabledCurrencies = state$.value.resDex.accounts.enabledCurrencies.slice()
    const { fields } = state$.value.roundedForm.resDexAccountsAddCurrencyModal

    enabledCurrencies.push(fields)
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

const copySmartAddressEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(ResDexAccountsActions.copySmartAddress),
  map(action => {
    const { currencies } = state$.value.resDex.accounts
    const currency = currencies[action.payload.symbol]
    clipboard.writeText(currency.address)

    return toastrActions.add({
      type: 'success',
      title: t(`{{currency}} smart address copied to clipboard`, { currency: getCurrencyName(action.payload.symbol) })
    })
  })
)

const deleteCurrencyEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(ResDexAccountsActions.deleteCurrency),
  map(action => {
    const { enabledCurrencies } = state$.value.resDex.accounts
    const filteredCurrencies = enabledCurrencies.filter(currency => currency.symbol !== action.payload.symbol)
    config.set('resDex.enabledCurrencies', filteredCurrencies)
    return ResDexAccountsActions.updateEnabledCurrencies(filteredCurrencies)
  })
)

const confirmCurrencyDeletionEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(ResDexAccountsActions.confirmCurrencyDeletion),
  mergeMap(action => (
    Observable.create(observer => {
      const confirmOptions = {
        onOk: () => {
          observer.next(of(ResDexAccountsActions.deleteCurrency(action.payload.symbol)))
          observer.complete()
        },
        onCancel: () => {
          observer.next(of(ResDexAccountsActions.empty()))
          observer.complete()
        }
      }
      const message = t(`Are you sure want to delete {{currency}}?`, {currency: getCurrencyName(action.payload.symbol)})
      toastr.confirm(message, confirmOptions)
    })
  )),
  mergeAll()
)

export const ResDexAccountsEpic = (action$, state$) => merge(
  enableCurrenciesEpic(action$, state$),
  getCurrenciesEpic(action$, state$),
  getCurrenciesFailedEpic(action$, state$),
  getTransactionsEpic(action$, state$),
  addCurrencyEpic(action$, state$),
  copySmartAddressEpic(action$, state$),
  deleteCurrencyEpic(action$, state$),
  confirmCurrencyDeletionEpic(action$, state$),
)

