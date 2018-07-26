// @flow
import { map, tap } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ofType } from 'redux-observable'

import { LoggerService, ConsoleTheme } from '../../../service/logger-service'
import { DialogService } from '../../../service/dialog-service';
import { ResistanceService } from '../../../service/resistance-service'
import { MinerService } from '../../../service/miner-service'
import { TorService } from '../../../service/tor-service'
import { SettingsActions } from './settings.reducer'

const epicInstanceName = 'SettingsEpics'

const logger = new LoggerService()
const dialogService: DialogService = new DialogService();
const config = require('electron-settings')

const resistanceService = new ResistanceService()
const minerService = new MinerService()
const torService = new TorService()

const startLocalNodeEpic = (action$: ActionsObservable<AppAction>, state$) => action$.pipe(
	ofType(SettingsActions.START_LOCAL_NODE),
	tap((action: AppAction) => logger.debug(epicInstanceName, `startLocalNodeEpic`, action.type, ConsoleTheme.testing)),
	tap(() => {
		const settingsState = state$.value.settings
		resistanceService.start(settingsState.isTorEnabled)
	}),
	map(() => SettingsActions.empty())
)

const stopLocalNodeEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
	ofType(SettingsActions.STOP_LOCAL_NODE),
	tap((action: AppAction) => logger.debug(epicInstanceName, `stopLocalNodeEpic`, action.type, ConsoleTheme.testing)),
	tap(() => {
		config.set('manageDaemon.enableMiner', false)
		minerService.stop()
		resistanceService.stop()
	}),
	map(() => SettingsActions.empty())
)

const toggleEnableMinerEpic = (action$: ActionsObservable<AppAction>, state$) => action$.pipe(
	ofType(SettingsActions.TOGGLE_ENABLE_MINER),
	tap((action: AppAction) => logger.debug(epicInstanceName, `toggleEnableMinerEpic`, action.type, ConsoleTheme.testing)),
	tap(() => {
		const settingsState = state$.value.settings
		config.set('manageDaemon.enableMiner', settingsState.isMinerEnabled)

		if (settingsState.isMinerEnabled) {
			console.log('Starting Miner')
			minerService.start()
		} else {
			minerService.stop()
		}
	}),
	map(() => SettingsActions.empty())
)

const toggleEnableTorEpic = (action$: ActionsObservable<AppAction>, state$) => action$.pipe(
	ofType(SettingsActions.TOGGLE_ENABLE_TOR),
	tap((action: AppAction) => logger.debug(epicInstanceName, `toggleEnableTorEpic`, action.type, ConsoleTheme.testing)),
	tap(() => {
		const settingsState = state$.value.settings
		config.set('manageDaemon.enableTor', settingsState.isTorEnabled)

		if (settingsState.isTorEnabled) {
			console.log('Starting Tor')
			torService.start()
		} else {
			torService.stop()
		}
	}),
	map(() => SettingsActions.empty())
)

const failTorProcessEpic = (action$: ActionsObservable<AppAction>, state$) => action$.pipe(
	ofType(SettingsActions.TOR_PROCESS_FAILED),
	tap((action: AppAction) => logger.debug(epicInstanceName, `failTorEpic`, action.type, ConsoleTheme.testing)),
	tap((action: AppAction) => {
    dialogService.showError(`Tor process failed`, action.payload.errorMessage)
  }),
	map(() => SettingsActions.empty())
)

export const SettingsEpics = (action$, state$) => merge(
	startLocalNodeEpic(action$, state$),
	stopLocalNodeEpic(action$, state$),
	toggleEnableMinerEpic(action$, state$),
	toggleEnableTorEpic(action$, state$),
	failTorProcessEpic(action$, state$)
)
