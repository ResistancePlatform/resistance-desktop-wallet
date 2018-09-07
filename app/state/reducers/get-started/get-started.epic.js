// @flow
import config from 'electron-settings'
import { of, merge } from 'rxjs'
import { filter, switchMap,  map, take, takeUntil } from 'rxjs/operators'
import { remote } from 'electron'
import { ofType } from 'redux-observable'
import { push } from 'react-router-redux'

import { Action } from '../types'
import { Bip39Service } from '~/service/bip39-service'
import { GetStartedActions } from './get-started.reducer'
import { SettingsActions } from '../settings/settings.reducer'


const bip39 = new Bip39Service()

const generateWalletEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(GetStartedActions.createNewWallet.generateWallet),
  switchMap(() => {
    const nodeConfig = remote.getGlobal('resistanceNodeConfig')
    return of(bip39.generateWallet(Boolean(nodeConfig.testnet)))
  }),
	map(result => GetStartedActions.createNewWallet.gotGeneratedWallet(result))
)

/* TODO: Handle errors and completion actions
 * https://github.com/ResistancePlatform/resistance-desktop-wallet/issues/136
 *
 * TODO: Add wallet creation / restoring with a mnemonic seed
 * https://github.com/ResistancePlatform/resistance-desktop-wallet/issues/128
 *
 * TODO: Add wallet encryption
 * https://github.com/ResistancePlatform/resistance-desktop-wallet/issues/129
 */
const useResistanceEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(GetStartedActions.useResistance),
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
    return of(SettingsActions.kickOffChildProcesses(), push('/overview'))
  }),
  takeUntil(action$.pipe(
    ofType(SettingsActions.childProcessStarted),
    filter(action => action.payload.processName === 'NODE'),
    switchMap(() => {
      const state = state$.value.getStarted
      const restoreForm = state$.value.roundedForm.getStartedRestoreYourWallet
      config.set('getStartedInProgress', false)

      if (!state.isCreatingNewWallet && restoreForm.fields.backupFile) {
        const keysFilePath = restoreForm.fields.backupFile
        return of(SettingsActions.importWallet(keysFilePath))
      }
      return of(GetStartedActions.empty())
    }),
    take(1)
  ))
)

export const GetStartedEpic = (action$, state$) => merge(
	generateWalletEpic(action$, state$),
  useResistanceEpic(action$, state$)
)
