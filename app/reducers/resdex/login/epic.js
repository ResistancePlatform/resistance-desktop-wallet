// @flow
import log from 'electron-log'
import config from 'electron-settings'
import { of, from, merge, concat, defer } from 'rxjs'
import { switchMap, map, mapTo, catchError, delay } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { routerActions } from 'react-router-redux'
import { actions as toastrActions } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { getStore } from '~/store/configureStore'
import { AUTH } from '~/constants/auth'
import { ChildProcessService } from '~/service/child-process-service'
import { SwapDBService } from '~/service/resdex/swap-db'
import { ResDexService } from '~/service/resdex/resdex'
import { RoundedFormActions } from '~/reducers/rounded-form/rounded-form.reducer'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'
import { ResDexPortfolioService } from '~/service/resdex/portfolio'
import { ResDexApiService } from '~/service/resdex/api'
import { ResDexLoginActions } from './reducer'
import { ResDexOrdersActions } from '~/reducers/resdex/orders/reducer'

const t = translate('resdex')

const childProcess = new ChildProcessService()
const swapDB = new SwapDBService()
const resDex = new ResDexService()
const api = new ResDexApiService()
const portfolio = new ResDexPortfolioService()


const getPortfolios = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexLoginActions.getPortfolios),
  switchMap(() => (
    from(portfolio.getPortfolios()).pipe(
      switchMap(portfolios => of(ResDexLoginActions.gotPortfolios(portfolios))),
      catchError(err => of(toastrActions.add({ type: 'error', title: err.message })))
    )
  ))
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
      switchMap((seedPhrase: string) => {
        api.setToken(seedPhrase)

        swapDB.init(seedPhrase)

        swapDB.on('change', () => {
          getStore().dispatch(ResDexOrdersActions.getSwapHistory())
        })

        const { walletPassword } = loginFields

        config.set('resDex.defaultPortfolioId', loginFields.portfolioId)

        return of(ResDexLoginActions.startResdex(seedPhrase, walletPassword))
      }),
      catchError(err => of(ResDexLoginActions.loginFailed(err.message)))
    )
  })
)

const startResdexEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexLoginActions.startResdex),
  switchMap(action => {
    const { seedPhrase, walletPassword } = action.payload

    const resDexStartedObservable = childProcess.getObservable({
      processName: 'RESDEX',
      onSuccess: of(ResDexLoginActions.initResdex(walletPassword)).pipe(delay(400)),  // Give marketmaker some time just in case
      onFailure: of(ResDexLoginActions.loginFailed(t(`Unable to start ResDEX, check the log for details`))),
      action$
    })

		resDex.start(seedPhrase)
    return resDexStartedObservable
  })
)

const initResdexEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexLoginActions.initResdex),
  switchMap(action => {
    api.enableSocket()

    const { enabledCurrencies } = state$.value.resDex.accounts

    const symbols = enabledCurrencies.map(currency => currency.symbol)

    const enableCurrenciesPromise = Promise.all(enabledCurrencies.map(currency => (
      api.enableCurrency(currency.symbol, currency.useElectrum)
    )))

    const getFeesPromise = Promise.all(symbols.map(symbol => api.getFee(symbol)))
    const getConfirmationsPromise = () => Promise.all(symbols.map(symbol => api.setConfirmationsNumber(symbol, 0)))

    const setConfirmationsObservable = defer(() => from(getConfirmationsPromise())).pipe(
      switchMap(() => {
        log.info(`Confirmations number set to 0 for all the currencies`)
        return of(ResDexLoginActions.empty())
      }),
      catchError(err => {
        log.error(`Failed to set zero confirmations number`, err)
        return of(ResDexLoginActions.empty())
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

    const sendPassphraseColdPromise = defer(
      () => from(
        api.sendWalletPassphrase(
          'RES',
          action.payload.walletPassword,
          AUTH.sessionTimeoutSeconds
        )
      )
    )

    const sendPassphraseObservable = sendPassphraseColdPromise.pipe(
      switchMap(() => of(
        ResDexLoginActions.loginSucceeded(),
        RoundedFormActions.clear('resDexLogin'),
        routerActions.push('/resdex/assets')
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
      switchMap(() => concat(
        sendPassphraseObservable,
        getFeesObservable,
        setConfirmationsObservable
      )),
      catchError(err => {
        log.error(`Can't enable currencies`, err)
        return of(ResDexLoginActions.loginFailed(t(`Error enabling currencies`)))
      })
    )

    return enableCurrenciesObservable
  })
)

const loginFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexLoginActions.loginFailed),
  map(action => (
    toastrActions.add({ type: 'error', title: action.payload.errorMessage })
  ))
)


const forgotPassword = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexLoginActions.forgotPassword),
  mapTo(toastrActions.add({
    type: 'warning',
    title: `Forgot password not implemented yet.`
  }))
)

export const ResDexLoginEpic = (action$, state$) => merge(
  getPortfolios(action$, state$),
  login(action$, state$),
  loginFailedEpic(action$, state$),
  startResdexEpic(action$, state$),
  initResdexEpic(action$, state$),
  forgotPassword(action$, state$),
)
