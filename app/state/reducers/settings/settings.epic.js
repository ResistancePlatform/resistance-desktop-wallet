// @flow
import config from 'electron-settings'
import { remote } from 'electron'
import { tap, filter, delay, map, flatMap, mergeMap, mapTo, catchError } from 'rxjs/operators'
import { of, bindCallback, concat, merge } from 'rxjs'
import { ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { i18n } from '~/i18next.config'
import { Action } from '../types'
import { RpcService } from '~/service/rpc-service'
import { ResistanceService } from '~/service/resistance-service'
import { MinerService } from '~/service/miner-service'
import { TorService } from '~/service/tor-service'
import { SettingsActions } from './settings.reducer'

const t = i18n.getFixedT(null, 'settings')
const rpcService = new RpcService()
const resistanceService = new ResistanceService()
const minerService = new MinerService()
const torService = new TorService()

const updateLanguageEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.updateLanguage),
  map(action => {
    i18n.changeLanguage(action.payload.code)
    config.set('language', action.payload.code)
    return SettingsActions.empty()
  })
)

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
  tap(() => { toastr.info(t(`Restarting the local node due to Tor activation.`)) }),
  filter(() => state$.value.settings.childProcessesStatus.NODE === 'RUNNING'),
  mapTo(SettingsActions.restartLocalNode())
)

const disableTorEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.disableTor),
	tap(() => { torService.stop() }),
  tap(() => { toastr.info(t(`Restarting the local node due to Tor shutdown.`)) }),
  filter(() => state$.value.settings.childProcessesStatus.NODE === 'RUNNING'),
  mapTo(SettingsActions.restartLocalNode())
)

const childProcessFailedEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.childProcessFailed),
	tap((action) => {
    // At Get Started stage the message is suppressed or displayed within a hint at Welcome page
    if (state$.value.getStarted.isInProgress && action.payload.processName === 'NODE') {
      return
    }
    const errorMessage = t(`Process {{processName}} has failed.`, { processName: action.payload.processName })
    toastr.error(t(`Child process failure`), `${errorMessage}\n${action.payload.errorMessage}`)
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
    const errorMessage = t(`Failed to stop {{processName}}.`, {processName: action.payload.processName})
    toastr.error(t(`Stop child process error`), `${errorMessage}\n${action.payload.errorMessage}`)
  }),
  mapTo(SettingsActions.empty())
)

const initiatePrivateKeysExportEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.initiatePrivateKeysExport),
  mergeMap(() => {
    const showSaveDialogObservable = bindCallback(remote.dialog.showSaveDialog.bind(remote.dialog))

    const title = t(`Export Resistance addresses private keys to a file`)
    const params = {
      title,
      defaultPath: remote.app.getPath('documents'),
      message: title,
      nameFieldLabel: t(`File name:`),
      filters: [{ name: t(`Keys files`),  extensions: ['keys'] }]
    }

    const observable = showSaveDialogObservable(params).pipe(
      map(([ filePath ]) => (
        filePath
          ? SettingsActions.exportPrivateKeys(filePath)
          : SettingsActions.empty()
      )))

    return observable
  })
)

const exportPrivateKeysEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.exportPrivateKeys),
  mergeMap(action => (
    rpcService.exportPrivateKeys(action.payload.filePath).pipe(
    map(() => {
      toastr.info(t(`Private keys exported successfully`))
      return SettingsActions.empty()
    }),
    catchError(err => {
      toastr.error(t(`Unable to export private keys`), err.message)
      return of(SettingsActions.empty())
    })
  )))
)

const initiatePrivateKeysImportEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.initiatePrivateKeysImport),
  mergeMap(() => {
    const showOpenDialogObservable = bindCallback(remote.dialog.showOpenDialog.bind(remote.dialog))

    const title = t(`Import Resistance addresses from private keys file`)
    const params = {
      title,
      defaultPath: remote.app.getPath('documents'),
      message: title,
      filters: [{ name: t(`Keys files`),  extensions: ['keys'] }]
    }

    const observable = showOpenDialogObservable(params).pipe(
      map(([ filePaths ]) => (
        filePaths && filePaths.length
          ? SettingsActions.importPrivateKeys(filePaths.pop())
          : SettingsActions.empty()
      )))

    return observable
  })
)

const importPrivateKeysEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.importPrivateKeys),
  mergeMap(action => (
    rpcService.importPrivateKeys(action.payload.filePath).pipe(
    map(() => {
      toastr.info(
        t(`Private keys imported successfully`),
        t(`It may take several minutes to rescan the block chain for transactions affecting the newly-added keys.`)
      )
      return SettingsActions.empty()
    }),
    catchError(err => {
      toastr.error(t(`Unable to import private keys`), err.message)
      return of(SettingsActions.empty())
    })
  )))
)

export const SettingsEpics = (action$, state$) => merge(
  updateLanguageEpic(action$, state$),
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
	initiatePrivateKeysExportEpic(action$, state$),
	exportPrivateKeysEpic(action$, state$),
  initiatePrivateKeysImportEpic(action$, state$),
	importPrivateKeysEpic(action$, state$),
)
