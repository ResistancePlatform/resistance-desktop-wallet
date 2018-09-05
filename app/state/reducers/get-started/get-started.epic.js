// @flow
import { of, merge } from 'rxjs'
import { switchMap,  map } from 'rxjs/operators'
import { remote } from 'electron'
import { ofType } from 'redux-observable'

import { Bip39Service } from '~/service/bip39-service'
import { GetStartedActions } from './get-started.reducer'


const bip39 = new Bip39Service()


const generateWalletEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(GetStartedActions.createNewWallet.generateWallet),
  switchMap(() => {
    const nodeConfig = remote.getGlobal('resistanceNodeConfig')
    return of(bip39.generateWallet(Boolean(nodeConfig.testnet)))
  }),
	map(result => GetStartedActions.createNewWallet.gotGeneratedWallet(result))
)

export const GetStartedEpic = (action$, state$) => merge(
	generateWalletEpic(action$, state$)
)
