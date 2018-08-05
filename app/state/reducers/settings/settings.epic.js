// @flow
import { tap, filter, mapTo, ignoreElements } from 'rxjs/operators'
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
  ignoreElements()
)

const stopLocalNodeEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(SettingsActions.stopLocalNode().type),
	tap(() => { resistanceService.stop() }),
  filter(() => state$.value.isMinerEnabled),
  mapTo(SettingsActions.disableMiner())
)

const enableMinerEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(SettingsActions.enableMiner().type),
	tap(() => { minerService.start() }),
  ignoreElements()
)

const disableMinerEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(SettingsActions.disableMiner().type),
	tap(() => { minerService.stop() }),
  ignoreElements()
)

const enableTorEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(SettingsActions.enableTor().type),
	tap(() => { torService.start() }),
  ignoreElements()
)

const childProcessFailedEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(SettingsActions.childProcessFailed().type),
	tap((action) => {
    dialogService.showError(`Process ${action.payload.processName} has failed`, action.payload.errorMessage)
  }),
  filter((action) => action.payload.processName === 'TOR'),
  mapTo(SettingsActions.stopLocalNode())
)

const childProcessMurderFailedEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(SettingsActions.childProcessMurderFailed().type),
	tap((action) => {
    dialogService.showError(`Error stopping ${action.payload.processName}`, action.payload.errorMessage)
  }),
  ignoreElements()
)

export const SettingsEpics = (action$, state$) => merge(
	startLocalNodeEpic(action$, state$),
	stopLocalNodeEpic(action$, state$),
  enableMinerEpic(action$, state$),
	disableMinerEpic(action$, state$),
	enableTorEpic(action$, state$),
	childProcessFailedEpic(action$, state$),
	childProcessMurderFailedEpic(action$, state$)
)
