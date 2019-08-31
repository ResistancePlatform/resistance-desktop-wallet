// @flow
import { clipboard } from 'electron'
import log from 'electron-log'
import config from 'electron-settings'
import { Decimal } from 'decimal.js'
import { Observable, of, from, concat, merge } from 'rxjs'
import { ofType } from 'redux-observable'
import { switchMap, map, mapTo, catchError } from 'rxjs/operators'
import { toastr } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { RoundedFormActions } from '~/reducers/rounded-form/rounded-form.reducer'
import { getSortedCurrencies, getCurrencyName } from '~/utils/resdex'
import { resDexApiFactory } from '~/service/resdex/api'
import { ResDexAssetsActions } from '~/reducers/resdex/assets/reducer'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'


const t = translate('resdex')
const mainApi = resDexApiFactory('RESDEX')

const getCurrenciesEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexAccountsActions.getCurrencies),
  switchMap(() => {
    const processNames = ['RESDEX', 'RESDEX_PRIVACY1', 'RESDEX_PRIVACY2']

    const getPortfoliosPromise = Promise.all(processNames.map(processName => {
      const api = resDexApiFactory(processName)
      return api.getPortfolio()
    }))

    const responseToCurrencies = response => response.portfolio.reduce((accumulator, currency) => ({
      ...accumulator,
      [currency.coin]: {
        symbol: currency.coin,
        name: getCurrencyName(currency.coin),
        address: currency.address,
        balance: Decimal(currency.balance),
        zcredits: Decimal(currency.zcredits || 0),
        price: Decimal(currency.price || 0),
        amount: Decimal(currency.amount || currency.balance),
      }
    }), {})

    return from(getPortfoliosPromise).pipe(
      switchMap(result => {

        const currencies = processNames.reduce((previous, processName, index) => ({
          ...previous,
          [processName]: responseToCurrencies(result[index])
        }), {})

        log.debug(`ResDEX Privacy 1 balance:`, currencies.RESDEX_PRIVACY1.RES.balance.toString())
        return of(ResDexAccountsActions.gotCurrencies(currencies))
      }),
      catchError(err => of(ResDexAccountsActions.getCurrenciesFailed(err.message)))
    )
  })
)

const getCurrenciesFailedEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
  ofType(ResDexAccountsActions.getCurrenciesFailed),
  map(action => {
    if (!state$.value.resDex.login.isInProgress) {
      toastr.error(t(`Error getting currencies from ResDEX`), action.payload.errorMessage)
    }
    return ResDexAccountsActions.empty()
  })
)


const getZCreditsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexAccountsActions.getZCredits),
  switchMap(() => {
    const observable = from(mainApi.getDynamicTrust('RES', Decimal(0))).pipe(
      switchMap(response => of(ResDexAccountsActions.gotZCredits(response.zCredits))),
      catchError(err => {
        log.error(`Can't get dynamic trust:`, err)
        return of(ResDexAccountsActions.getZCreditsFailed(t(`Error getting Instant DEX status, check the log for details`)))
      })
    )

    return observable
  })
)

const getTransactionsEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexAccountsActions.getTransactions),
  switchMap(() => {
    const { accounts } = state$.value.resDex
    const { enabledCurrencies } = accounts
    const { RESDEX: currencies } = accounts.currencies

    if (Object.keys(currencies).length === 0) {
      log.warn(`Portfolio hasn't been fetched yet, can't get transactions history.`)
      return of(ResDexAccountsActions.gotCurrencyTransactions('RES', null))
    }

    const observables = getSortedCurrencies(enabledCurrencies).map(currency => {
      const { symbol } = currency

      const observable = from(mainApi.getTransactionHistory(symbol, currencies[symbol].address)).pipe(
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

const updateCurrencyEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(ResDexAccountsActions.updateCurrency),
  switchMap(() => {
    const enabledCurrencies = state$.value.resDex.accounts.enabledCurrencies.slice()
    const { fields } = state$.value.roundedForm.resDexAccountsAddCurrencyModal
    const { symbol } = fields
    const currencyName = getCurrencyName(symbol)

    const index = enabledCurrencies.findIndex(currency => currency.symbol === symbol)
    enabledCurrencies[index] = fields
    config.set('resDex.enabledCurrencies', enabledCurrencies)

    const restartCurrencyPromise = mainApi.disableCurrency(symbol).finally(() => {
      log.debug(`Disabled ${symbol} now re-enabling it`)
      return mainApi.enableCurrency(symbol, fields.useElectrum)
    })

    const restartCurrencyObservable = from(restartCurrencyPromise).pipe(
      switchMap(() => {
        log.debug(`Re-enabled ${symbol}, forcing portfolio fetching`)
        return of(ResDexAccountsActions.getCurrencies())
      }),
      catchError(err => {
        log.error(`Can't restart currency ${symbol}`, err)
        toastr.error(t(`Error enabling {{currencyName}}, check the application log for details`, { currencyName }))
        return of(ResDexAccountsActions.empty())
      })
    )

    log.info("Updated:", fields)
    toastr.success(
      t(`Currency {{currencyName}} ({{symbol}}) updated`, { currencyName, symbol })
    )

    return concat(
      of(ResDexAccountsActions.closeAddCurrencyModal()),
      of(ResDexAccountsActions.updateEnabledCurrencies(enabledCurrencies)),
      restartCurrencyObservable
    )
  })
)

const instantDexDepositEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
  ofType(ResDexAccountsActions.instantDexDeposit),
  switchMap(() => {
    const { weeks, amount } = state$.value.roundedForm.resDexAccountsInstantDexDepositModal.fields

    const observable = from(mainApi.instantDexDeposit(Number(weeks), Decimal(amount)))

    return observable.pipe(
      switchMap(() => {
        toastr.success(t(`Instant DEX depositing of ${amount.toString()} RES succeeded`))
        return of(ResDexAccountsActions.closeInstantDexDepositModal())
      }),
      catchError(err => {
        log.error(`Can't perform instant DEX deposit`, err, err.response)
        toastr.error(t(`Error performing instant DEX deposit`))
        return of(ResDexAccountsActions.instantDexDepositFailed())
      })
    )
  })
)

const withdrawEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
  ofType(ResDexAccountsActions.withdraw),
  switchMap(() => {
    const { recipientAddress, amount } = state$.value.roundedForm.resDexAccountsWithdrawModal.fields
    const { symbol, secretFunds } = state$.value.resDex.accounts.withdrawModal

    const api = resDexApiFactory(secretFunds ? 'RESDEX_PRIVACY2' : 'RESDEX')

    const observable = from(api.withdraw({
      symbol,
      address: recipientAddress,
      amount: Decimal(amount),
    }))

    return observable.pipe(
      switchMap(() => {
        toastr.success(t(`Withdrawal of ${amount.toString()} ${symbol} succeeded`))
        return of(ResDexAccountsActions.closeWithdrawModal())
      }),
      catchError(err => {
        log.error(`Can't withdraw ${symbol}`, err, err.response)
        toastr.error(t(`Error withdrawing ${symbol}`, err.message))
        return of(ResDexAccountsActions.withdrawalFailed())
      })
    )
  })
)

const addCurrencyEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(ResDexAccountsActions.addCurrency),
  switchMap(() => {
    const enabledCurrencies = state$.value.resDex.accounts.enabledCurrencies.slice()
    const { fields } = state$.value.roundedForm.resDexAccountsAddCurrencyModal
    const { symbol } = fields
    const currencyName = getCurrencyName(symbol)

    enabledCurrencies.push(fields)
    config.set('resDex.enabledCurrencies', enabledCurrencies)

    const enableCurrencyPromise = mainApi.enableCurrency(symbol, fields.useElectrum)

    const enableCurrencyObservable = from(enableCurrencyPromise).pipe(
      switchMap(() => of(ResDexAccountsActions.getCurrencies())),
      catchError(err => {
        log.error(`Can't enable currency ${symbol}`, err)
        toastr.error(t(`Error enabling {{currencyName}}, check the application log for details`, { currencyName }))
        return of(ResDexAccountsActions.empty())
      })
    )

    toastr.success(t(`Currency {{currency}} ({{symbol}}) added`, { currencyName, symbol }))

    return concat(
      of(ResDexAccountsActions.updateEnabledCurrencies(enabledCurrencies)),
      of(ResDexAssetsActions.getCurrencyHistory()),
      of(ResDexAccountsActions.selectCurrency(symbol)),
      of(ResDexAccountsActions.closeAddCurrencyModal()),
      enableCurrencyObservable
    )
  })
)

const copySmartAddressEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(ResDexAccountsActions.copySmartAddress),
  map(action => {
    const { RESDEX: currencies } = state$.value.resDex.accounts.currencies
    const currency = currencies[action.payload.symbol]
    clipboard.writeText(currency.address)
    toastr.success(t(`{{currency}} smart address copied to clipboard`,
                     { currency: getCurrencyName(action.payload.symbol) }))
    return ResDexAccountsActions.empty()
  })
)

const deleteCurrencyEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(ResDexAccountsActions.deleteCurrency),
  switchMap(action => {
    const { enabledCurrencies } = state$.value.resDex.accounts
    const filteredCurrencies = enabledCurrencies.filter(currency => currency.symbol !== action.payload.symbol)
    config.set('resDex.enabledCurrencies', filteredCurrencies)

    const { symbol } = action.payload
    const currencyName = getCurrencyName(symbol)

    const disableCurrencyObservable = from(mainApi.disableCurrency(symbol)).pipe(
      switchMap(() => of(ResDexAccountsActions.empty())),
      catchError(err => {
        log.error(`Can't disable currency ${symbol}`, err)
        toastr.error(t(`Error disabling {{currencyName}}, check the application log for details`, { currencyName }))
        return of(ResDexAccountsActions.empty())
      })
    )

    toastr.success(t(`Currency {{currencyName}} ({{symbol}}) deleted`, { currencyName, symbol }))
    return concat(
      of(ResDexAccountsActions.updateEnabledCurrencies(filteredCurrencies)),
      of(ResDexAccountsActions.selectCurrency('RES')),
      disableCurrencyObservable
    )
  })
)

const confirmCurrencyDeletionEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(ResDexAccountsActions.confirmCurrencyDeletion),
  switchMap(action => (
    Observable.create(observer => {
      const confirmOptions = {
        onOk: () => {
          observer.next(ResDexAccountsActions.deleteCurrency(action.payload.symbol))
          observer.complete()
        },
        onCancel: () => {
          observer.next(ResDexAccountsActions.empty())
          observer.complete()
        }
      }
      const message = t(`Are you sure want to delete {{currency}}?`, {currency: getCurrencyName(action.payload.symbol)})
      toastr.confirm(message, confirmOptions)
    })
  ))
)

const closeAddCurrencyModalEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(ResDexAccountsActions.closeAddCurrencyModal),
  mapTo(RoundedFormActions.clear('resDexAccountsAddCurrencyModal'))
)


const closeWithdrawModalEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(ResDexAccountsActions.closeWithdrawModal),
  mapTo(RoundedFormActions.clear('resDexAccountsWithdrawModal'))
)

export const ResDexAccountsEpic = (action$, state$) => merge(
  getCurrenciesEpic(action$, state$),
  getCurrenciesFailedEpic(action$, state$),
  getZCreditsEpic(action$, state$),
  getTransactionsEpic(action$, state$),
  copySmartAddressEpic(action$, state$),
  addCurrencyEpic(action$, state$),
  updateCurrencyEpic(action$, state$),
  deleteCurrencyEpic(action$, state$),
  confirmCurrencyDeletionEpic(action$, state$),
  instantDexDepositEpic(action$, state$),
  withdrawEpic(action$, state$),
  closeAddCurrencyModalEpic(action$, state$),
  closeWithdrawModalEpic(action$, state$),
)
