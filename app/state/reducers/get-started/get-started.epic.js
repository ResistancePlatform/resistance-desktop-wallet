// @flow
import config from 'electron-settings'
import { of, race, concat, merge } from 'rxjs'
import { filter, switchMap, take, map, mergeMap, mapTo, catchError } from 'rxjs/operators'
import { remote } from 'electron'
import { ofType } from 'redux-observable'
import { push } from 'react-router-redux'
import { toastr } from 'react-redux-toastr'

import { Action } from '../types'
import { AUTH } from '~/constants/auth'
import { RpcService } from '~/service/rpc-service'
import { Bip39Service } from '~/service/bip39-service'
import { GetStartedActions } from './get-started.reducer'
import { RoundedFormActions } from '../rounded-form/rounded-form.reducer'
import { SettingsActions } from '../settings/settings.reducer'


const bip39 = new Bip39Service()
const rpc = new RpcService()

function getNodeStartObservable(emitActionOnStart: Action, action$: ActionsObservable<Action>): ActionsObservable<Action> {
  const observable = race(
    action$.pipe(
      ofType(SettingsActions.childProcessStarted),
      filter(action => action.payload.processName === 'NODE'),
      take(1),
      mapTo(emitActionOnStart)
    ),
    action$.pipe(
      ofType(SettingsActions.childProcessFailed),
      filter(action => action.payload.processName === 'NODE'),
      take(1),
      mapTo(GetStartedActions.walletBootstrappingFailed(`Unable to start Resistance local node, please try again or contact the support.`)),
    )
  )

  return observable
}

const generateWalletEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(GetStartedActions.createNewWallet.generateWallet),
  switchMap(() => {
    const nodeConfig = remote.getGlobal('resistanceNodeConfig')
    return of(bip39.generateWallet(Boolean(nodeConfig.testnet)))
  }),
	map(result => GetStartedActions.createNewWallet.gotGeneratedWallet(result))
)

const applyConfigurationEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(GetStartedActions.applyConfiguration),
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

    const nodeStartedObservable = getNodeStartObservable(GetStartedActions.encryptWallet(), action$)
    return concat(
      of(GetStartedActions.displayHint(`Starting local Resistance node...`)),
      of(SettingsActions.startLocalNode()),
      nodeStartedObservable
    )
  })
)

const encryptWalletEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(GetStartedActions.encryptWallet),
  switchMap(() => {
    const choosePasswordForm = state$.value.roundedForm.getStartedChoosePassword

    // Wallet encryption shuts the node down, let's start it back up and trigger the next action
    const nodeStartedObservable = getNodeStartObservable(GetStartedActions.authenticateAndRestoreWallet(), action$)

    const nodeShutDownObservable = action$.pipe(
      ofType(SettingsActions.childProcessFailed),
      filter(action => action.payload.processName === 'NODE'),
      take(1),
      switchMap(() => concat(
        of(GetStartedActions.displayHint(`Starting the local node and the miner...`)),
        of(SettingsActions.kickOffChildProcesses()),
        nodeStartedObservable
      ))
    )

    const observable = rpc.encryptWallet(choosePasswordForm.fields.password).pipe(
      switchMap(() => nodeShutDownObservable),
      catchError(err => of(GetStartedActions.walletBootstrappingFailed(err.toString())))
    )

    return concat(of(GetStartedActions.displayHint(`Encrypting the wallet...`)), observable)
  })
)

const authenticateAndRestoreWalletEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(GetStartedActions.authenticateAndRestoreWallet),
  switchMap(() => {
    const state = state$.value.getStarted
    const choosePasswordForm = state$.value.roundedForm.getStartedChoosePassword

    const importWalletObservable = race(
      action$.pipe(
        ofType(SettingsActions.importWalletSuccess),
        take(1),
        mapTo(GetStartedActions.walletBootstrappingSucceeded())
      ),
      action$.pipe(
        ofType(SettingsActions.importWalletFailure),
        take(1),
        map(action => GetStartedActions.walletBootstrappingFailed(action.payload.errorMessage))
      )
    )

    let nextObservable

    if (!state.isCreatingNewWallet) {
      const restoreForm = state$.value.roundedForm.getStartedRestoreYourWallet
      const keysFilePath = restoreForm.fields.backupFile
      nextObservable = concat(
        of(GetStartedActions.displayHint(`Restoring the wallet from the backup file...`)),
        of(SettingsActions.importWallet(keysFilePath)),
        importWalletObservable
      )
    } else {
      nextObservable = of(GetStartedActions.walletBootstrappingSucceeded())
    }

    const sendWalletObservable = rpc.sendWalletPassword(choosePasswordForm.fields.password, AUTH.sessionTimeoutSeconds).pipe(
      mergeMap(() => nextObservable),
      catchError(err => of(GetStartedActions.walletBootstrappingFailed(err.toString())))
    )

    return concat(
      of(GetStartedActions.displayHint(`Sending the wallet password to the node...`)),
      sendWalletObservable
    )
  })
)

const walletBootstrappingSucceededEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(GetStartedActions.walletBootstrappingSucceeded),
  map(() => {
    config.set('getStartedInProgress', false)
    toastr.success(`Wallet bootstrapping succeeded.`)
    // Don't store the password in the state
    return RoundedFormActions.clear('getStartedChoosePassword')
  })
)

const walletBootstrappingFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(GetStartedActions.walletBootstrappingFailed),
  map((action) => {
    toastr.error(`Wallet bootstrapping failed`, action.payload.errorMessage)
    return GetStartedActions.empty()
  })
)

const useResistanceEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(GetStartedActions.useResistance),
  mapTo(push('/overview'))
)

export const GetStartedEpic = (action$, state$) => merge(
	generateWalletEpic(action$, state$),
	applyConfigurationEpic(action$, state$),
  encryptWalletEpic(action$, state$),
  authenticateAndRestoreWalletEpic(action$, state$),
  walletBootstrappingSucceededEpic(action$, state$),
  walletBootstrappingFailedEpic(action$, state$),
  useResistanceEpic(action$, state$)
)
