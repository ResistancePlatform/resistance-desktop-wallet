// @flow
import log from 'electron-log'
import config from 'electron-settings'
import { of, from, merge, concat, defer } from 'rxjs'
import { switchMap, map, catchError, delay } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { routerActions } from 'react-router-redux'
import { toastr } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { getStore } from '~/store/configureStore'
import { AUTH } from '~/constants/auth'
import { ChildProcessService } from '~/service/child-process-service'
import { SwapDBService } from '~/service/resdex/swap-db'
import { ResDexService } from '~/service/resdex/resdex'
import { RoundedFormActions } from '~/reducers/rounded-form/rounded-form.reducer'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'
import { ResDexPortfolioService } from '~/service/resdex/portfolio'
import { resDexApiFactory } from '~/service/resdex/api'
import { ResDexLoginActions } from './reducer'
import { ResDexOrdersActions } from '~/reducers/resdex/orders/reducer'

const t = translate('resdex')

const childProcess = new ChildProcessService()
const swapDB = new SwapDBService()
const resDex = new ResDexService()
const portfolio = new ResDexPortfolioService()


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

const startResdexEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexLoginActions.startResdex),
  switchMap(action => {
    const { seedPhrase, walletPassword } = action.payload

    swapDB.init(seedPhrase)

    swapDB.on('change', () => {
      getStore().dispatch(ResDexOrdersActions.getSwapHistory())
    })

    // Start 3 ResDEX processes, one for transparent and two for private trades
    const observables = ['RESDEX', 'RESDEX_PRIVACY1', 'RESDEX_PRIVACY2'].map(processName => {
      const api = resDexApiFactory(processName)
      api.setToken(seedPhrase)
      resDex.start(processName, seedPhrase)

      const resDexStartedObservable = defer(() => childProcess.getObservable({
        processName,
        onSuccess: of(ResDexLoginActions.initResdex(processName, walletPassword)).pipe(delay(400)),  // Give marketmaker some time just in case
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

    api.enableSocket()

    const { enabledCurrencies } = state$.value.resDex.accounts

    const symbols = enabledCurrencies.map(currency => currency.symbol)

    const enableCurrenciesPromise = Promise.all(enabledCurrencies.map(currency => (
      api.enableCurrency(currency.symbol, currency.useElectrum)
    )))

    const getFeesPromise = Promise.all(symbols.map(symbol => api.getFee(symbol)))

    const getFeesObservable = from(getFeesPromise).pipe(
      switchMap(fees => {
        const feesMap = fees.reduce((previous, fee, index) =>(
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
      switchMap(() => concat(
        sendPassphraseObservable,
        getFeesObservable,
        of(ResDexOrdersActions.getSwapHistory()),
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
  map(action => {
    toastr.error(action.payload.errorMessage)
    return routerActions.push('/resdex')
  })
)

export const ResDexLoginEpic = (action$, state$) => merge(
  getPortfolios(action$, state$),
  login(action$, state$),
  loginFailedEpic(action$, state$),
  setDefaultPortfolioEpic(action$, state$),
  startResdexEpic(action$, state$),
  initResdexEpic(action$, state$),
)
