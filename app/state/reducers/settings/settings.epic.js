// @flow
import config from 'electron-settings'
import path from 'path'
import * as fs from 'fs'
import { promisify } from 'util'
import { remote, ipcRenderer } from 'electron'
import { tap, filter, delay, mergeMap, flatMap, switchMap, map, mapTo, catchError } from 'rxjs/operators'
import { of, from, bindCallback, concat, merge } from 'rxjs'
import { ofType } from 'redux-observable'
import { toastr, actions as toastrActions } from 'react-redux-toastr'

import { i18n } from '~/i18next.config'
import { getEnsureLoginObservable } from '~/utils/auth'
import { Action } from '../types'
import { getStartLocalNodeObservable } from '~/utils/child-process'
import { RpcService } from '~/service/rpc-service'
import { ResistanceService } from '~/service/resistance-service'
import { MinerService } from '~/service/miner-service'
import { TorService } from '~/service/tor-service'
import { AuthActions } from '../auth/auth.reducer'
import { SettingsActions } from './settings.reducer'

const t = i18n.getFixedT(null, 'settings')
const rpc = new RpcService()
const resistanceService = new ResistanceService()
const minerService = new MinerService()
const torService = new TorService()

const updateLanguageEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.updateLanguage),
  map(action => {
    i18n.changeLanguage(action.payload.code)
    config.set('language', action.payload.code)
    ipcRenderer.send('change-language', action.payload.code)
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

const initiateWalletBackupEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.initiateWalletBackup),
  mergeMap(() => {
    const showSaveDialogObservable = bindCallback(remote.dialog.showSaveDialog.bind(remote.dialog))

    const title = t(`Backup resistance wallet to a file`)
    const params = {
      title,
      defaultPath: remote.app.getPath('documents'),
      message: title,
      nameFieldLabel: t(`File name:`),
      filters: [{ name: t(`Wallet files`),  extensions: ['dat'] }]
    }

    const observable = showSaveDialogObservable(params).pipe(
      switchMap(([ filePath ]) => (
        filePath
          ? of(SettingsActions.backupWallet(filePath))
          : of(SettingsActions.empty())
      )))

    const reason = t(`We're going to backup the wallet`)
    return getEnsureLoginObservable(reason, observable, action$)
  })
)

const backupWalletEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.backupWallet),
  mergeMap(action => (
    rpc.backupWallet(action.payload.filePath).pipe(
      switchMap(() => {
        toastr.success(t(`Wallet backup succeeded.`))
        return of(SettingsActions.empty())
      }),
      catchError(err => {
        toastr.error(t(`Unable to backup the wallet`), err.message)
        return of(SettingsActions.empty())
      })
  )))
)

const initiateWalletRestoreEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.initiateWalletRestore),
  mergeMap(() => {
    const showOpenDialogObservable = bindCallback(remote.dialog.showOpenDialog.bind(remote.dialog))

    const title = t(`Restore the wallet from a backup file`)
    const params = {
      title,
      defaultPath: remote.app.getPath('documents'),
      message: title,
      filters: [{ name: t(`Wallet files`),  extensions: ['dat'] }]
    }

    const observable = showOpenDialogObservable(params).pipe(
      switchMap(([ filePaths ]) => (
        filePaths && filePaths.length
          ? of(SettingsActions.restoreWallet(filePaths.pop()))
          : of(SettingsActions.empty())
      )))

    const reason = t(`We're going to restore the wallet`)
    return getEnsureLoginObservable(reason, observable, action$)
  })
)

const restoreWalletEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.restoreWallet),
  switchMap(action => {
    const walletFileName = path.basename(action.payload.filePath)
    const newWalletPath = path.join(resistanceService.getWalletPath(), walletFileName)

    // Third, send the password for the new wallet
    const startLocalNodeObservable = getStartLocalNodeObservable(
      concat(
        of(AuthActions.ensureLogin(t(`Your restored wallet password is required`), true)),
        of(toastrActions.add({
          type: 'success',
          title: t(`Wallet restored successfully.`)
        }))
      ),
      of(SettingsActions.restoringWalletFailed()),
      action$
    )

    const copyPromise = promisify(fs.copyFile)(action.payload.filePath, newWalletPath)

    // Second, copy the backed up wallet to the export directory, update the config and restart the node
    const copyObservable = from(copyPromise).pipe(
      switchMap(() => {
        const walletName = path.basename(walletFileName, path.extname(walletFileName))
        config.set('wallet.name', walletName)
        return concat(
          of(toastrActions.add({
            type: 'info',
            title: t(`Restarting the local node with the new wallet...`)
          })),
          of(SettingsActions.restartLocalNode()),
          startLocalNodeObservable
        )
      }),
      catchError(err => SettingsActions.restoringWalletFailed(err.message))
    )

    // First, check if wallet file already exists
    const result = from(promisify(fs.access)(newWalletPath)).pipe(
      switchMap(() => {
        const errorMessage = t(`Wallet file "{{walletFileName}}" already exists.`, { walletFileName })
        return of(SettingsActions.restoringWalletFailed(errorMessage))
      }),
      catchError(() => copyObservable)
    )

    return result
  })
)

const restoringWalletFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.restoringWalletFailed),
  map(action => {
    toastr.error(t(`Failed to restore the wallet`), action.payload.errorMessage)
    return SettingsActions.empty()
  })
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
  initiateWalletBackupEpic(action$, state$),
  initiateWalletRestoreEpic(action$, state$),
  backupWalletEpic(action$, state$),
  restoreWalletEpic(action$, state$),
  restoringWalletFailedEpic(action$, state$),
	childProcessFailedEpic(action$, state$),
	childProcessMurderFailedEpic(action$, state$)
)
