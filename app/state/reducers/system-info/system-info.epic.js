// @flow
import { shell } from 'electron'
import { tap, mapTo } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { AppAction } from '../appAction'
import { SystemInfoActions } from './system-info.reducer'
import { RpcService } from '../../../service/rpc-service'
import { ResistanceService } from '../../../service/resistance-service'
import { OSService } from '../../../service/os-service'

const rpcService = new RpcService()
const resistanceService = new ResistanceService()
const osService = new OSService()

const getDaemonInfoEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
  ofType(SystemInfoActions.getDaemonInfo.toString()),
  tap(() => rpcService.requestDaemonInfo()),
  mapTo(SystemInfoActions.empty())
)

const getDaemonInfoFailureEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
  ofType(SystemInfoActions.getDaemonInfoFailure.toString()),
  tap((action) => {
    if (action.payload.code !== -28) {
      toastr.error(action.payload.errorMessage)
    } else {
      console.log(`Suppressing RPC initialization error display.`, action.payload)
    }
  }),
  mapTo(SystemInfoActions.empty())
)

const getBlockchainInfoEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
  ofType(SystemInfoActions.getBlockchainInfo.toString()),
  tap(() => rpcService.requestBlockchainInfo()),
  mapTo(SystemInfoActions.empty())
)

const getBlockchainInfoFailureEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
  ofType(SystemInfoActions.getBlockchainInfoFailure.toString()),
  tap((action) => {
    if (action.payload.code !== -28) {
      toastr.error(action.payload.errorMessage)
    } else {
      console.log(`Suppressing RPC initialization error display.`, action.payload)
    }
  }),
  mapTo(SystemInfoActions.empty())
)

const openWalletInFileManagerEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
  ofType(SystemInfoActions.openWalletInFileManager.toString()),
  tap(() => {
    shell.openItem(resistanceService.getWalletPath())
  }),
  mapTo(SystemInfoActions.empty())
)

const openInstallationFolderEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
  ofType(SystemInfoActions.openInstallationFolder.toString()),
  tap(() => {
    shell.openItem(osService.getInstallationPath())
  }),
  mapTo(SystemInfoActions.empty())
)

export const SystemInfoEpics = (action$, state$) => merge(
  openWalletInFileManagerEpic(action$, state$),
  openInstallationFolderEpic(action$, state$),
  getDaemonInfoEpic(action$, state$),
  getDaemonInfoFailureEpic(action$, state$),
  getBlockchainInfoEpic(action$, state$),
  getBlockchainInfoFailureEpic(action$, state$)
)
