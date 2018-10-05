// @flow
import { of, from, merge } from 'rxjs'
import { switchMap, mapTo, catchError } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { actions as toastrActions } from 'react-redux-toastr'

// import { translate } from '~/i18next.config'
import { ResDexPortfolioService } from '~/service/resdex/portfolio'
import { ResDexLoginActions } from './reducer'

// const t = translate('resdex')
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

    const decryptObservable = from(portfolio.decryptSeedPhrase(encryptedSeedPhrase, loginFields.password))

    return decryptObservable.pipe(
      switchMap((seedPhrase: string) => of(
        ResDexLoginActions.loginSucceeded(),
        ResDexLoginActions.startMarketMaker(seedPhrase)
      )),
      catchError(err => of(displayErrorAction(err)))
    )
  })
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
  forgotPassword(action$, state$),
)
