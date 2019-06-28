// @flow
import log from 'electron-log'
import config from 'electron-settings'
import path from 'path'
import * as fs from 'fs'
import { promisify } from 'util'
import { remote, ipcRenderer } from 'electron'
import {
  tap,
  filter,
  delay,
  mergeMap,
  flatMap,
  switchMap,
  map,
  mapTo,
  catchError,
  timeout
} from 'rxjs/operators'
import {
  of,
  from,
  bindCallback,
  concat,
  merge,
  defer
} from 'rxjs'
import { ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { i18n, translate } from '~/i18next.config'
import { RPC } from '~/constants/rpc'
import { getEnsureLoginObservable } from '~/utils/auth'
import { Action } from '../types'
import { AuthActions } from '../auth/auth.reducer'
import { SettingsActions } from './settings.reducer'
import { RpcService } from '~/service/rpc-service'
import { ChildProcessService } from '~/service/child-process-service'
import { ResistanceService } from '~/service/resistance-service'
import { MinerService } from '~/service/miner-service'
import { TorService } from '~/service/tor-service'

const t = translate('settings')
const rpc = new RpcService()
const resistanceService = new ResistanceService()
const minerService = new MinerService()
const childProcess = new ChildProcessService()
const torService = new TorService()

const savePasswordEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.savePassword),
  switchMap(() => {
    const { oldPassword, newPassword } = state$.value.roundedForm.settingsSavePassword.fields
    const observable = from(rpc.changeWalletPassword(oldPassword, newPassword)).pipe(
      switchMap(() => {
        toastr.success(t(`Password changed.`))
        return of(SettingsActions.savePasswordCompleted())
      }),
      catchError(err => {
        let errorMessage

        if (err.code === RPC.WALLET_PASSPHRASE_INCORRECT) {
          errorMessage = t(`The old wallet password is incorrect.`)
        } else {
          log.error(`Can't save password`, err.message)
          errorMessage = t(`Error changing the password, check the log for details.`)
        }
        toastr.error(errorMessage)
        return of(SettingsActions.savePasswordCompleted())
      })
    )
    return observable
  })
)

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

    // return concat(observables, of(SettingsActions.startEtomicNode()))
    return concat(observables)
  })
)

const toggleLocalNodeEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.toggleLocalNode),
  map(() => {
    const { childProcessesStatus } = state$.value.settings
		switch (childProcessesStatus.NODE) {
			case 'RUNNING':
			case 'MURDER FAILED':
				return SettingsActions.stopLocalNode()
			case 'NOT RUNNING':
			case 'FAILED':
				return SettingsActions.startLocalNode()
			default:
		}
    return SettingsActions.empty()
	})
)

const startLocalNodeEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.startLocalNode),
  map(() => {
		const settingsState = state$.value.settings
		resistanceService.start(settingsState.isTorEnabled)
    return SettingsActions.empty()
  })
)

const restartLocalNodeEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.restartLocalNode),
	tap(() => {
		const settingsState = state$.value.settings
		resistanceService.restart(settingsState.isTorEnabled)
	}),
  mapTo(AuthActions.ensureLogin(t(`Wallet password is required due to the local node restart`), true))
)

const stopLocalNodeEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.stopLocalNode),
	tap(() => { resistanceService.stop() }),
  filter(() => state$.value.settings.isMinerEnabled),
  mapTo(SettingsActions.disableMiner())
)

const startEtomicNodeEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.startEtomicNode),
  map(() => {
		resistanceService.start(false, true)
    return SettingsActions.empty()
  })
)

const stopEtomicNodeEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.stopEtomicNode),
  map(() => {
		resistanceService.stop(true)
    return SettingsActions.empty()
  })
)

const toggleMinerEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.toggleMiner),
  map(() => {
    const { isMinerEnabled } = state$.value.settings
    const nextAction = isMinerEnabled
      ? SettingsActions.disableMiner()
      : SettingsActions.enableMiner()
		return nextAction
  })
)

const enableMinerEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.enableMiner),
  tap(() => {
    const threadsNumber = config.get('manageDaemon.cpuCoresNumber')
    minerService.start(threadsNumber)
    config.set('manageDaemon.enableMiner', true)
  }),
  mapTo(SettingsActions.empty())
)

const disableMinerEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.disableMiner),
  tap(() => {
    minerService.stop()
    config.set('manageDaemon.enableMiner', false)
  }),
  mapTo(SettingsActions.empty())
)

const setCpuCoresNumberEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SettingsActions.setCpuCoresNumber),
  map(action => {
    config.set('manageDaemon.cpuCoresNumber', action.payload.cpuCoresNumber)
    return SettingsActions.empty()
  })
)

const toggleTorEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.toggleTor),
  map(() => {
    const { isTorEnabled } = state$.value.settings
    const nextAction = isTorEnabled
      ? SettingsActions.disableTor()
      : SettingsActions.enableTor()
		return nextAction
  })
)

const enableTorEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.enableTor),
  tap(() => {
    torService.start()
    config.set('manageDaemon.enableTor', true)
  }),
  tap(() => { toastr.info(t(`Restarting the local node due to Tor activation.`)) }),
  filter(() => state$.value.settings.childProcessesStatus.NODE === 'RUNNING'),
  mapTo(SettingsActions.restartLocalNode())
)

const disableTorEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.disableTor),
  tap(() => {
    torService.stop()
    config.set('manageDaemon.enableTor', false)
  }),
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
    const startLocalNodeObservable = childProcess.getStartObservable({
      processName: 'NODE',
      onSuccess: concat(
        of(AuthActions.ensureLogin(t(`Your restored wallet password is required`), true)),
        of(defer(() => toastr.success(t(`Wallet restored successfully.`)))),
      ),
      onFailure: of(SettingsActions.restoringWalletFailed()),
      action$
    })

    const copyPromise = promisify(fs.copyFile)(action.payload.filePath, newWalletPath)

    // Second, copy the backed up wallet to the export directory, update the config and restart the node
    const copyObservable = from(copyPromise).pipe(
      switchMap(() => {
        const walletName = path.basename(walletFileName, path.extname(walletFileName))
        config.set('wallet.name', walletName)
        return concat(
          of(defer(() => toastr.info(t(`Restarting the local node with the new wallet...`)))),
          of(SettingsActions.restartLocalNode()),
          startLocalNodeObservable
        )
      }),
      catchError(err => of(SettingsActions.restoringWalletFailed(err.message)))
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

const stopChildProcessesEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SettingsActions.stopChildProcesses),
  switchMap(() => {
    const { childProcessesStatus } = state$.value.settings

    log.debug(`Gracefully stopping all running processes`)

    const notRunningStatuses = ['NOT RUNNING', 'FAILED']
    let runningProcesses = []

    Object.entries(childProcessesStatus).forEach(([name, status]) => {
      if (notRunningStatuses.includes(status)) {
        return
      }
      log.debug(`Stopping ${name}`)
      runningProcesses.push(name)
      childProcess.stopProcess(name)
    })

    if (runningProcesses.length === 0) {
      log.debug(`No running processes, quiting immediately`)
      ipcRenderer.send('cleanup-complete')
      return of(SettingsActions.empty())
    }

    return action$.pipe(
      // TODO: Increase and lock the window after the demo
      timeout(5000),
      ofType(SettingsActions.childProcessMurdered),
      switchMap(action => {
        runningProcesses = runningProcesses.filter(name => name !== action.payload.processName)
        if (runningProcesses.length === 0) {
          log.debug(`Cleanup complete, informing the main process`)
          ipcRenderer.send('cleanup-complete')
        }
        return of(SettingsActions.empty())
      }),
      catchError(() => {
        log.error(`Stopping child processes timed out`)
        ipcRenderer.send('cleanup-complete')
        return of(SettingsActions.empty())
      })
    )

  })
)


export const SettingsEpics = (action$, state$) => merge(
  savePasswordEpic(action$, state$),
  updateLanguageEpic(action$, state$),
	kickOffChildProcessesEpic(action$, state$),
  toggleLocalNodeEpic(action$, state$),
	startLocalNodeEpic(action$, state$),
  restartLocalNodeEpic(action$, state$),
	stopLocalNodeEpic(action$, state$),
  startEtomicNodeEpic(action$, state$),
  stopEtomicNodeEpic(action$, state$),
  toggleMinerEpic(action$, state$),
  enableMinerEpic(action$, state$),
	disableMinerEpic(action$, state$),
  setCpuCoresNumberEpic(action$, state$),
  toggleTorEpic(action$, state$),
	enableTorEpic(action$, state$),
	disableTorEpic(action$, state$),
  initiateWalletBackupEpic(action$, state$),
  initiateWalletRestoreEpic(action$, state$),
  backupWalletEpic(action$, state$),
  restoreWalletEpic(action$, state$),
  restoringWalletFailedEpic(action$, state$),
	childProcessFailedEpic(action$, state$),
	childProcessMurderFailedEpic(action$, state$),
  stopChildProcessesEpic(action$, state$),
)
