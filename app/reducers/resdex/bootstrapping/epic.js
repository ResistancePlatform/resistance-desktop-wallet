// @flow
import log from 'electron-log'
import { clipboard } from 'electron'
import bip39 from 'bip39'
import config from 'electron-settings'
import { of, merge, defer } from 'rxjs'
import { switchMap, map, mapTo, catchError } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { routerActions } from 'react-router-redux'
import { toastr } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { ResDexPortfolioService } from '~/service/resdex/portfolio'
import { RoundedFormActions } from '~/reducers/rounded-form/rounded-form.reducer'
import { ResDexLoginActions } from '~/reducers/resdex/login/reducer'
import { ResDexBootstrappingActions } from './reducer'

const t = translate('resdex')

const portfolio = new ResDexPortfolioService()


const startRestoringPortfolioEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexBootstrappingActions.startRestoringPortfolio),
  switchMap(() => of(
    routerActions.push('/resdex/restore-portfolio'),
    RoundedFormActions.clear('resDexCreatePortfolio'),
    RoundedFormActions.clear('resDexEnterSeedPhrase'),
  ))
)

const startCreatingPortfolioEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexBootstrappingActions.startCreatingPortfolio),
  switchMap(() => of(
    routerActions.push('/resdex/create-portfolio'),
    RoundedFormActions.clear('resDexCreatePortfolio'),
    RoundedFormActions.clear('resDexEnterSeedPhrase'),
  ))
)

const copySeedPhraseEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexBootstrappingActions.copySeedPhrase),
  map(() => {
    const { generatedSeedPhrase } = state$.value.resDex.bootstrapping
    clipboard.writeText(generatedSeedPhrase)
    toastr.success(t(`Seed phrase copied to clipboard`))
    return ResDexBootstrappingActions.empty()
  })
)

const generateSeedPhraseEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexBootstrappingActions.generateSeedPhrase),
  map(() => {
    const seedPhrase = bip39.generateMnemonic()
    return ResDexBootstrappingActions.seedPhraseGenerated(seedPhrase)
  })
)

const createPortfolioEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexBootstrappingActions.createPortfolio),
  switchMap(() => {
    const { isRestoring, generatedSeedPhrase } = state$.value.resDex.bootstrapping
    const { seedPhrase: enteredSeedPhrase } = state$.value.roundedForm.resDexEnterSeedPhrase.fields

    if (!isRestoring && generatedSeedPhrase !== enteredSeedPhrase) {
      return of(
        ResDexLoginActions.loginFailed(t(`The seed phrase you entered is not the same as the generated one`)),
      )
    }
    const seedPhrase = isRestoring ? enteredSeedPhrase : generatedSeedPhrase

    const { fields } = state$.value.roundedForm.resDexCreatePortfolio

    const createObservable = defer(() => portfolio.create({
      name: fields.name,
      seedPhrase,
      password: fields.resDexPassword,
    }))

    return createObservable.pipe(
      switchMap((portfolioId: string) =>  {
        config.set('resDex.bootstrappingInProgress', false)
        toastr.success(t(`Portfolio {{name}} created`, { name: fields.name }))
        return of(
          ResDexBootstrappingActions.bootstrappingCompleted(),
          ResDexLoginActions.startResdex(seedPhrase, fields.walletPassword),
          ResDexLoginActions.setDefaultPortfolio(portfolioId),
          // Reset default portfolio in case of ResDex start failure
          RoundedFormActions.clear('resDexLogin'),
        )
      }),
      catchError(err => {
        log.error(`Can't create portfolio`, err)
        toastr.error(t(`Error creating portfolio, check the application log for details`))
        return of(ResDexBootstrappingActions.empty())
      })
    )

  })
)

const forgotPassword = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(ResDexBootstrappingActions.forgotPassword),
  map(() => {
    toastr.warning(`Forgot password not implemented yet.`)
    return ResDexBootstrappingActions.empty()
  })
)

export const ResDexBootstrappingEpic = (action$, state$) => merge(
  startRestoringPortfolioEpic(action$, state$),
  startCreatingPortfolioEpic(action$, state$),
  copySeedPhraseEpic(action$, state$),
  generateSeedPhraseEpic(action$, state$),
  createPortfolioEpic(action$, state$),
  forgotPassword(action$, state$),
)

