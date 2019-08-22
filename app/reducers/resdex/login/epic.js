// @flow
import log from 'electron-log'
import config from 'electron-settings'
import { remote } from 'electron'
import { Observable, of, from, merge, concat, defer } from 'rxjs'
import { switchMap, map, catchError, delay } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { routerActions } from 'react-router-redux'
import { toastr } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { AUTH } from '~/constants/auth'
import { resDexApiFactory } from '~/service/resdex/api'
import { ChildProcessService } from '~/service/child-process-service'
import { ResDexService } from '~/service/resdex/resdex'
import { RoundedFormActions } from '~/reducers/rounded-form/rounded-form.reducer'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'
import { ResDexPortfolioService } from '~/service/resdex/portfolio'
import { LoadingPopupActions } from '~/reducers/loading-popup/loading-popup.reducer'
import { ResDexLoginActions } from './reducer'
import { ResDexOrdersActions } from '~/reducers/resdex/orders/reducer'

const t = translate('resdex')
// 3 ResDEX processes, one for transparent and two for private trades
const resDexProcessNames = ['RESDEX', 'RESDEX_PRIVACY1', 'RESDEX_PRIVACY2']

const childProcess = new ChildProcessService()
const resDex = new ResDexService()
const portfolio = new ResDexPortfolioService()


const kycRegister = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexLoginActions.kycRegister),
  switchMap(action => {
    const { tid } = action.payload
    const resDexApi = resDexApiFactory('RESDEX')

    // TODO: Reuse in case of per-portfolio KYC
    // this.props.actions.updatePortfolio(defaultPortfolioId, { isVerified: true, tid })

    const observable = from(resDexApi.kycRegister(tid))
      .pipe(isRegistered => {
        if (!isRegistered) {
          toastr.error(t(`Error submitting verification data to ResDEX, please make sure your Internet connection is good or check the log for details.`))
        }
        return ResDexLoginActions.empty()
      })

    return observable
  })
)

const getPortfolios = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexLoginActions.getPortfolios),
  switchMap(() => (
    from(portfolio.getPortfolios()).pipe(
      switchMap(portfolios => (
        of(ResDexLoginActions.gotPortfolios(portfolios))
      )),
      catchError(err => {
        toastr.error(err.message)
        return ResDexLoginActions.empty()
      })
    )
  ))
)

const updatePortfolio = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexLoginActions.updatePortfolio),
  switchMap(action => {
    const { id, fields } = action.payload

    return from(portfolio.update(id, fields)).pipe(
      switchMap(() => (
        of(ResDexLoginActions.getPortfolios(), routerActions.push('/resdex'))
      )),
      catchError(err => {
        log.error(`Can't update portfolio`, err)
        toastr.error(t(`Error updating portfolio, check the log for details.`))
        return ResDexLoginActions.empty()
      })
    )
  })
)

const login = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexLoginActions.login),
  switchMap(() => {
    const { portfolios } = state$.value.resDex.login
    const loginFields = state$.value.roundedForm.resDexLogin.fields
    const { encryptedSeedPhrase } = portfolios.find(p => p.id === loginFields.portfolioId)

    // TODO: add wallet password check

    const decryptObservable = from(portfolio.decryptSeedPhrase(encryptedSeedPhrase, loginFields.resDexPassword))

    return decryptObservable.pipe(
      switchMap((seedPhrase: string) => (
        of(
          ResDexLoginActions.startResdex(seedPhrase, loginFields.walletPassword),
          ResDexLoginActions.setDefaultPortfolio(loginFields.portfolioId),
        )
      )),
      catchError(err => of(ResDexLoginActions.loginFailed(err.message)))
    )
  })
)

const setDefaultPortfolioEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexLoginActions.setDefaultPortfolio),
  map(action => {
    config.set('resDex.defaultPortfolioId', action.payload.id)
    return ResDexLoginActions.empty()
  })
)

const startResdexEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexLoginActions.startResdex),
  switchMap(action => {
    const { seedPhrase, walletPassword } = action.payload

    const observables = resDexProcessNames.map(processName => {
      const api = resDexApiFactory(processName)
      api.setToken(seedPhrase)
      resDex.start(processName, seedPhrase)

      let nextObservable = of(ResDexLoginActions.initResdex(processName, walletPassword))

      const { tid } = state$.value.kyc

      if (tid !== null) {
        log.debug(`KYC tid will be registered with ResDEX`)
        nextObservable = concat(nextObservable, of(ResDexLoginActions.kycRegister(tid)))
      }

      const resDexStartedObservable = defer(() => childProcess.getStartObservable({
        processName,
        onSuccess: nextObservable.pipe(delay(400)),  // Give marketmaker some time just in case
        onFailure: of(ResDexLoginActions.loginFailed(t(`Unable to start ResDEX, check the log for details`))),
        action$
      }))

      return resDexStartedObservable
    })

    return merge(...observables)
  })
)

const initResdexEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexLoginActions.initResdex),
  switchMap(action => {
    const { processName, walletPassword } = action.payload

    const api = resDexApiFactory(processName)

    const { enabledCurrencies } = state$.value.resDex.accounts

    const symbols = enabledCurrencies.map(currency => currency.symbol)

    const enableCurrenciesPromise = Promise.all(enabledCurrencies.map(currency => (
      api.enableCurrency(currency.symbol, currency.useElectrum)
    )))

    const getFeesPromise = Promise.all(symbols.map(symbol => api.getFee(symbol)))

    const getFeesObservable = from(getFeesPromise).pipe(
      switchMap(fees => {
        const feesMap = fees.reduce((previous, fee, index) => (
          { ...previous, [symbols[index]]: fee }
        ), {})
        return of(ResDexAccountsActions.gotCurrencyFees(feesMap))
      }),
      catchError(err => {
        log.error(`Failed to get currencies fees`, err)
        toastr.error(t(`Error getting currencies fees`))
        return of(ResDexLoginActions.empty())
      })
    )

    const sendPassphraseColdPromise = defer(
      () => from(
        api.sendWalletPassphrase(
          'RES',
          walletPassword,
          AUTH.sessionTimeoutSeconds
        )
      )
    )

    const sendPassphraseObservable = sendPassphraseColdPromise.pipe(
      switchMap(() => of(
        routerActions.push('/resdex'),
        ResDexLoginActions.loginSucceeded(),
        RoundedFormActions.clear('resDexLogin')
      )),
      catchError(err => {
        log.error(`Failed to send Resistance wallet passphrase`, JSON.stringify(err))
        const errorMessage = err.code === -14
          ? t(`Incorrect Resistance wallet password`)
          : t(`Error sending wallet password`)
        return of(ResDexLoginActions.loginFailed(errorMessage))
      })
    )

    const enableCurrenciesObservable = from(enableCurrenciesPromise).pipe(
      switchMap(results => {
        const inactiveSymbols = (enabledCurrencies
         .filter((currency, index) => !results[index])
         .map(currency => currency.symbol)
        )

        let observables = concat(
          sendPassphraseObservable,
          getFeesObservable,
          of(ResDexOrdersActions.getSwapHistory()),
        )

        if (inactiveSymbols.length) {
          toastr.error(t(`Error enabling {{symbols}}`, { symbols: inactiveSymbols.join(', ') }))
          observables = concat(
            observables,
            ResDexAccountsActions.markCurrenciesAsDisabled(inactiveSymbols)
          )
        }

        return observables
      }),
      catchError(err => {
        // TODO: Do some proper treatment like marking the coin as failed to get enabled
        log.error(`Can't enable currencies`, JSON.stringify(err.data), err)
        return of(ResDexLoginActions.empty())
      })
    )

    return enableCurrenciesObservable
  })
)

const loginFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexLoginActions.loginFailed),
  map(action => {
    toastr.error(action.payload.errorMessage)
    return routerActions.push('/resdex')
  })
)

const confirmLogout = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexLoginActions.confirmLogout),
  switchMap(() => (
    Observable.create(observer => {
      const confirmOptions = {
        onOk: () => {
          observer.next(ResDexLoginActions.logout())
          observer.complete()
        },
        onCancel: () => {
          observer.next(ResDexLoginActions.empty())
          observer.complete()
        }
      }

      const { orders, operations } = remote.getGlobal('pendingActivities')

      const message = orders || operations
        ? t(`Pending activities are present: logging out from ResDEX may lead to unpredictable consequences. Are you sure?`)
        : t(`Are you sure want to logout from ResDEX?`)

      toastr.confirm(message, confirmOptions)
    })
  ))
)

const logout = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexLoginActions.logout),
  switchMap(() => {
    const observables = resDexProcessNames.map(processName => {
      childProcess.stopProcess(processName)

      const resDexStoppedObservable = defer(() => childProcess.getStopObservable({
        processName,
        onSuccess: of(LoadingPopupActions.hide(), ResDexLoginActions.logoutSucceeded()),  // Give marketmaker some time just in case
        onFailure: of(LoadingPopupActions.hide(), ResDexLoginActions.logoutFailed(t(`Unable to stop a {{processName}} process, check the log for details`, { processName }))),
        action$
      }))

      return resDexStoppedObservable
    })

    observables.push(of(LoadingPopupActions.show(t(`Logging out from ResDEX.`))))

    return merge(...observables)
  })
)

export const ResDexLoginEpic = (action$, state$) => merge(
  kycRegister(action$, state$),
  getPortfolios(action$, state$),
  updatePortfolio(action$, state$),
  login(action$, state$),
  loginFailedEpic(action$, state$),
  setDefaultPortfolioEpic(action$, state$),
  startResdexEpic(action$, state$),
  initResdexEpic(action$, state$),
  confirmLogout(action$, state$),
  logout(action$, state$),
)
