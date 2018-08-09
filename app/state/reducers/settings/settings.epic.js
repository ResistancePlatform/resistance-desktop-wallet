// @flow
import { tap, filter, map, mapTo } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ofType } from 'redux-observable'

import { DialogService } from '../../../service/dialog-service';
import { ResistanceService } from '../../../service/resistance-service'
import { MinerService } from '../../../service/miner-service'
import { TorService } from '../../../service/tor-service'
import { SettingsActions } from './settings.reducer'

const dialogService: DialogService = new DialogService()
const resistanceService = new ResistanceService()
const minerService = new MinerService()
const torService = new TorService()

const startLocalNodeEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(SettingsActions.startLocalNode().type),
	tap(() => {
		const settingsState = state$.value.settings
		resistanceService.start(settingsState.isTorEnabled)
	}),
  mapTo(SettingsActions.empty())
)

const restartLocalNodeEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(SettingsActions.restartLocalNode().type),
	tap(() => {
		const settingsState = state$.value.settings
		resistanceService.restart(settingsState.isTorEnabled)
	}),
  mapTo(SettingsActions.empty())
)

const stopLocalNodeEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(SettingsActions.stopLocalNode().type),
	tap(() => { resistanceService.stop() }),
  filter(() => state$.value.settings.isMinerEnabled),
  mapTo(SettingsActions.disableMiner())
)

const enableMinerEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(SettingsActions.enableMiner().type),
	tap(() => { minerService.start() }),
  mapTo(SettingsActions.empty())
)

const disableMinerEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(SettingsActions.disableMiner().type),
	tap(() => { minerService.stop() }),
  mapTo(SettingsActions.empty())
)

const enableTorEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(SettingsActions.enableTor().type),
	tap(() => { torService.start() }),
  filter(() => state$.value.settings.childProcessesStatus.NODE === 'RUNNING'),
  mapTo(SettingsActions.restartLocalNode())
)

const disableTorEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(SettingsActions.disableTor().type),
	tap(() => { torService.stop() }),
  filter(() => state$.value.settings.childProcessesStatus.NODE === 'RUNNING'),
  mapTo(SettingsActions.restartLocalNode())
)

const childProcessFailedEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(SettingsActions.childProcessFailed().type),
	tap((action) => {
    if (process.env.NODE_ENV !== 'development') {
      const errorMessage =`Process ${action.payload.processName} has failed.\n${action.payload.errorMessage}`
      dialogService.showError(`Child process failure`, errorMessage)
    }
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

const childProcessMurderFailedEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(SettingsActions.childProcessMurderFailed().type),
	tap((action) => {
    const errorMessage = `Failed to stop ${action.payload.processName}.\n${action.payload.errorMessage}`
    dialogService.showError(`Stop child process error`, errorMessage)
  }),
  mapTo(SettingsActions.empty())
)

export const SettingsEpics = (action$, state$) => merge(
	startLocalNodeEpic(action$, state$),
  restartLocalNodeEpic(action$, state$),
	stopLocalNodeEpic(action$, state$),
  enableMinerEpic(action$, state$),
	disableMinerEpic(action$, state$),
	enableTorEpic(action$, state$),
	disableTorEpic(action$, state$),
	childProcessFailedEpic(action$, state$),
	childProcessMurderFailedEpic(action$, state$)
)
