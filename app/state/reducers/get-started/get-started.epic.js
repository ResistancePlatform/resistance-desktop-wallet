// @flow
import config from 'electron-settings'
import { of, concat, merge } from 'rxjs'
import { filter, switchMap, take, map, mergeMap, mapTo, catchError } from 'rxjs/operators'
import { remote } from 'electron'
import { ofType } from 'redux-observable'
import { push } from 'react-router-redux'
import { i18n } from '~/i18next.config'

import { Action } from '../types'
import { getStartLocalNodeObservable } from '~/utils/child-process'
import { AUTH } from '~/constants/auth'
import { RpcService } from '~/service/rpc-service'
import { Bip39Service } from '~/service/bip39-service'
import { AuthActions } from '../auth/auth.reducer'
import { GetStartedActions } from './get-started.reducer'
import { RoundedFormActions } from '../rounded-form/rounded-form.reducer'
import { SettingsActions } from '../settings/settings.reducer'


const t = i18n.getFixedT(null, 'get-started')
const bip39 = new Bip39Service()
const rpc = new RpcService()


const WelcomeActions = GetStartedActions.welcome
const unableToStartLocalNodeMessage = t(`Unable to start Resistance local node, please try again or contact the support.`)

const chooseLanguageEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(GetStartedActions.chooseLanguage),
  mergeMap(action => of(
    SettingsActions.updateLanguage(action.payload.code),
    push('/get-started/get-started')
  ))
)

const generateWalletEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(GetStartedActions.createNewWallet.generateWallet),
  switchMap(() => {
    const nodeConfig = remote.getGlobal('resistanceNodeConfig')
    return of(bip39.generateWallet(Boolean(nodeConfig.testnet)))
  }),
	map(result => GetStartedActions.createNewWallet.gotGeneratedWallet(result))
)

const applyConfigurationEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(WelcomeActions.applyConfiguration),
  switchMap(() => {
    const state = state$.value

    let form
    if (state.getStarted.isCreatingNewWallet) {
      form = state.roundedForm.getStartedCreateNewWallet
    } else {
      form = state.roundedForm.getStartedRestoreYourWallet
    }

    config.set('wallet', {
      name: form.fields.walletName,
      path: form.fields.walletPath
    })

    const nodeStartedObservable = getStartLocalNodeObservable(
      WelcomeActions.encryptWallet(),
      WelcomeActions.walletBootstrappingFailed(unableToStartLocalNodeMessage),
      action$
    )

    return concat(
      of(WelcomeActions.displayHint(t(`Starting local Resistance node...`))),
      of(SettingsActions.startLocalNode()),
      nodeStartedObservable
    )
  })
)

const encryptWalletEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(WelcomeActions.encryptWallet),
  switchMap(() => {
    const choosePasswordForm = state$.value.roundedForm.getStartedChoosePassword

    // Wallet encryption shuts the node down, let's start it back up and trigger the next action
    const nodeStartedObservable = getStartLocalNodeObservable(
      WelcomeActions.authenticateAndRestoreWallet(),
      WelcomeActions.walletBootstrappingFailed(unableToStartLocalNodeMessage),
      action$
    )

    const nodeShutDownObservable = action$.pipe(
      ofType(SettingsActions.childProcessFailed),
      filter(action => action.payload.processName === 'NODE'),
      take(1),
      switchMap(() => concat(
        of(WelcomeActions.displayHint(t(`Starting the local node again...`))),
        of(SettingsActions.kickOffChildProcesses()),
        nodeStartedObservable
      ))
    )

    const observable = rpc.encryptWallet(choosePasswordForm.fields.password).pipe(
      switchMap(() => nodeShutDownObservable),
      catchError(err => of(WelcomeActions.walletBootstrappingFailed(err.toString())))
    )

    return concat(of(WelcomeActions.displayHint(t(`Encrypting the wallet...`))), observable)
  })
)

const authenticateAndRestoreWalletEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(WelcomeActions.authenticateAndRestoreWallet),
  switchMap(() => {
    const state = state$.value.getStarted
    const choosePasswordForm = state$.value.roundedForm.getStartedChoosePassword
    const nextObservables = [of(AuthActions.loginSucceeded())]

    if (!state.isCreatingNewWallet) {
      const restoreForm = state$.value.roundedForm.getStartedRestoreYourWallet
      const keysFilePath = restoreForm.fields.backupFile

      const importPrivateKeysObservable = rpc.importPrivateKeys(keysFilePath).pipe(
        mapTo(WelcomeActions.walletBootstrappingSucceeded()),
        catchError(err => of(WelcomeActions.walletBootstrappingFailed(err.message)))
      )

      nextObservables.push(
        of(WelcomeActions.displayHint(t(`Restoring the wallet from the private keys...`))),
        importPrivateKeysObservable
      )
    } else {
      nextObservables.push(of(WelcomeActions.walletBootstrappingSucceeded()))
    }

    const sendWalletObservable = rpc.sendWalletPassword(choosePasswordForm.fields.password, AUTH.sessionTimeoutSeconds).pipe(
      mergeMap(() => concat(...nextObservables)),
      catchError(err => of(WelcomeActions.walletBootstrappingFailed(err.toString())))
    )

    return concat(
      of(WelcomeActions.displayHint(t(`Sending the wallet password to the node...`))),
      sendWalletObservable
    )
  })
)

const walletBootstrappingSucceededEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(WelcomeActions.walletBootstrappingSucceeded),
  map(() => {
    config.set('getStartedInProgress', false)
    // Don't store the password in the state
    return RoundedFormActions.clear('getStartedChoosePassword')
  })
)

const useResistanceEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(WelcomeActions.useResistance),
  mapTo(push('/overview'))
)

export const GetStartedEpic = (action$, state$) => merge(
	chooseLanguageEpic(action$, state$),
	generateWalletEpic(action$, state$),
	applyConfigurationEpic(action$, state$),
  encryptWalletEpic(action$, state$),
  authenticateAndRestoreWalletEpic(action$, state$),
  walletBootstrappingSucceededEpic(action$, state$),
  useResistanceEpic(action$, state$)
)
