// @flow
import config from 'electron-settings'
import { of, merge } from 'rxjs'
import { switchMap,  map } from 'rxjs/operators'
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
    console.error("wallet", config.get('wallet'))

    // TODO: Import the private key, encrypt the wallet, remove private information from the state
    return of(SettingsActions.kickOffChildProcesses(), push('/overview'))
  })
)

export const GetStartedEpic = (action$, state$) => merge(
	generateWalletEpic(action$, state$),
  useResistanceEpic(action$, state$)
)
