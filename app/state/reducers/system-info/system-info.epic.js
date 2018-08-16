// @flow
import { shell } from 'electron'
import { tap, mapTo } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'

import { SystemInfoActions } from './system-info.reducer'
import { RpcService } from '../../../service/rpc-service'
import { ResistanceService } from '../../../service/resistance-service'
import { OSService } from '../../../service/os-service'

const rpcService = new RpcService()
const resistanceService = new ResistanceService()
const osService = new OSService()

const getDaemonInfoEpic = (action$: ActionsObservable<any>) => action$.pipe(
  ofType(SystemInfoActions.getDaemonInfo().type),
  tap(() => rpcService.requestDaemonInfo()),
  mapTo(SystemInfoActions.empty())
)

const getBlockchainInfoEpic = (action$: ActionsObservable<any>) => action$.pipe(
  ofType(SystemInfoActions.getBlockchainInfo().type),
  tap(() => rpcService.requestBlockchainInfo()),
  mapTo(SystemInfoActions.empty())
)

const openWalletInFileManagerEpic = (action$: ActionsObservable<any>) => action$.pipe(
  ofType(SystemInfoActions.openWalletInFileManager().type),
  tap(() => {
    shell.openItem(resistanceService.getWalletPath())
  }),
  mapTo(SystemInfoActions.empty())
)

const openInstallationFolderEpic = (action$: ActionsObservable<any>) => action$.pipe(
  ofType(SystemInfoActions.openInstallationFolder().type),
  tap(() => {
    shell.openItem(osService.getInstallationPath())
  }),
  mapTo(SystemInfoActions.empty())
)

export const SystemInfoEpics = (action$, state$) => merge(
  openWalletInFileManagerEpic(action$, state$),
  openInstallationFolderEpic(action$, state$),
  getDaemonInfoEpic(action$, state$),
  getBlockchainInfoEpic(action$, state$)
)
