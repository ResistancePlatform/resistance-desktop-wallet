// @flow
import { tap, filter, delay, map, flatMap, mapTo } from 'rxjs/operators'
import { of, concat, merge } from 'rxjs'
import { ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { Action } from '../types'
import { RpcService } from '~/service/rpc-service'
import { ResistanceService } from '~/service/resistance-service'
import { MinerService } from '~/service/miner-service'
import { TorService } from '~/service/tor-service'
import { SettingsActions } from './settings.reducer'

const rpcService = new RpcService()
const resistanceService = new ResistanceService()
const minerService = new MinerService()
const torService = new TorService()

const kickOffChildProcessesEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.kickOffChildProcesses),
  flatMap(() => {
		const settingsState = state$.value.settings
    let observables

    if (settingsState.isTorEnabled) {
      observables = concat(
        of(SettingsActions.enableTor()),
        of(SettingsActions.startLocalNode()).pipe(delay(200))
      )
    } else {
      observables = of(SettingsActions.startLocalNode())
    }

    if (settingsState.isMinerEnabled) {
      observables = concat(
        observables,
        of(SettingsActions.enableMiner()).pipe(delay(1000))
      )
    }

    return observables
  })
)

const startLocalNodeEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.startLocalNode),
	tap(() => {
		const settingsState = state$.value.settings
		resistanceService.start(settingsState.isTorEnabled)
	}),
  mapTo(SettingsActions.empty())
)

const restartLocalNodeEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.restartLocalNode),
	tap(() => {
		const settingsState = state$.value.settings
		resistanceService.restart(settingsState.isTorEnabled)
	}),
  mapTo(SettingsActions.empty())
)

const stopLocalNodeEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.stopLocalNode),
	tap(() => { resistanceService.stop() }),
  filter(() => state$.value.settings.isMinerEnabled),
  mapTo(SettingsActions.disableMiner())
)

const enableMinerEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.enableMiner),
	tap(() => { minerService.start() }),
  mapTo(SettingsActions.empty())
)

const disableMinerEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.disableMiner),
	tap(() => { minerService.stop() }),
  mapTo(SettingsActions.empty())
)

const enableTorEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.enableTor),
	tap(() => { torService.start() }),
  tap(() => { toastr.info(`Restarting the local node due to Tor activation.`) }),
  filter(() => state$.value.settings.childProcessesStatus.NODE === 'RUNNING'),
  mapTo(SettingsActions.restartLocalNode())
)

const disableTorEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.disableTor),
	tap(() => { torService.stop() }),
  tap(() => { toastr.info(`Restarting the local node due to Tor shutdown.`) }),
  filter(() => state$.value.settings.childProcessesStatus.NODE === 'RUNNING'),
  mapTo(SettingsActions.restartLocalNode())
)

const childProcessFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.childProcessFailed),
	tap((action) => {
    const errorMessage =`Process ${action.payload.processName} has failed.\n${action.payload.errorMessage}`
    toastr.error(`Child process failure`, errorMessage)
  }),
	map((action) => {
    if (action.payload.processName === 'NODE') {
        return SettingsActions.disableMiner()
    }

    if (action.payload.processName === 'TOR') {
        return SettingsActions.stopLocalNode()
    }

    return SettingsActions.empty()
  })
)

const childProcessMurderFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.childProcessMurderFailed),
	tap((action) => {
    const errorMessage = `Failed to stop ${action.payload.processName}.\n${action.payload.errorMessage}`
    toastr.error(`Stop child process error`, errorMessage)
  }),
  mapTo(SettingsActions.empty())
)

const exportWalletEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.exportWallet),
	tap((action) => { rpcService.exportWallet(action.payload.filePath) }),
  mapTo(SettingsActions.empty())
)

const exportWalletSuccessEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.exportWalletSuccess),
	tap(() => {
    toastr.info(`Wallet backup succeeded.`)
  }),
  mapTo(SettingsActions.empty())
)

const exportWalletFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.exportWalletFailure),
	tap((action) => {
    toastr.error(`Unable to backup the wallet`, action.payload.errorMessage)
  }),
  mapTo(SettingsActions.empty())
)

const importWalletEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.importWallet),
	tap((action) => {
    rpcService.importWallet(action.payload.filePath)
	}),
  mapTo(SettingsActions.empty())
)

const importWalletSuccessEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.importWalletSuccess),
	tap(() => {
    toastr.info(`Wallet restored successfully`,
                `It may take several minutes to rescan the block chain for transactions affecting the newly-added keys.`)
  }),
  mapTo(SettingsActions.empty())
)

const importWalletFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.importWalletFailure),
	tap((action) => {
    toastr.error(`Unable to restore wallet`, action.payload.errorMessage)
  }),
  mapTo(SettingsActions.empty())
)

export const SettingsEpics = (action$, state$) => merge(
	kickOffChildProcessesEpic(action$, state$),
	startLocalNodeEpic(action$, state$),
  restartLocalNodeEpic(action$, state$),
	stopLocalNodeEpic(action$, state$),
  enableMinerEpic(action$, state$),
	disableMinerEpic(action$, state$),
	enableTorEpic(action$, state$),
	disableTorEpic(action$, state$),
	childProcessFailedEpic(action$, state$),
	childProcessMurderFailedEpic(action$, state$),
	exportWalletEpic(action$, state$),
	exportWalletSuccessEpic(action$, state$),
	exportWalletFailureEpic(action$, state$),
	importWalletEpic(action$, state$),
	importWalletSuccessEpic(action$, state$),
	importWalletFailureEpic(action$, state$),
)
