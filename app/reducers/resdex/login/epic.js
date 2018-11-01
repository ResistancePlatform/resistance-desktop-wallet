// @flow
import config from 'electron-settings'
import { of, from, merge, concat } from 'rxjs'
import { switchMap, map, mapTo, catchError, delay } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { actions as toastrActions } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { getStore } from '~/store/configureStore'
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
const displayErrorAction = err => toastrActions.add({ type: 'error', title: err.message })



const getPortfolios = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexLoginActions.getPortfolios),
  switchMap(() => (
    from(portfolio.getPortfolios()).pipe(
      switchMap(portfolios => of(ResDexLoginActions.gotPortfolios(portfolios))),
      catchError(err => of(displayErrorAction(err)))
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
      catchError(err => of(displayErrorAction(err)))
    )
  })
)

const startResDexEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexLoginActions.startResdex),
  switchMap(action => {
    const { seedPhrase, walletPassword } = action.payload

    const resDexStartedObservable = childProcess.getObservable({
      processName: 'RESDEX',
      onSuccess: concat(
        of(ResDexAccountsActions.initCurrencies(walletPassword)).pipe(delay(400)),  // Give marketmaker some time just in case
        of(ResDexLoginActions.loginSucceeded()),
        of(RoundedFormActions.clear('resDexLogin'))
      ),
      onFailure: of(ResDexLoginActions.loginFailed(t(`Unable to start ResDEX, check the log for details`))),
      action$
    })

		resDex.start(seedPhrase)
    return resDexStartedObservable
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
  startResDexEpic(action$, state$),
  forgotPassword(action$, state$),
)
