// @flow
import { shell } from 'electron'
import { tap, mapTo } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'

import { SystemInfoActions } from './system-info.reducer'
import { ResistanceCliService } from '../../../service/resistance-cli-service'
import { ResistanceService } from '../../../service/resistance-service'
import { OSService } from '../../../service/os-service'

const resistanceCliService = new ResistanceCliService()
const resistanceService = new ResistanceService()
const osService = new OSService()

const startGettingDaemonInfoEpic = (action$: ActionsObservable<any>) => action$.pipe(
  ofType(SystemInfoActions.startGettingDaemonInfo().type),
  tap(() => resistanceCliService.startPollingDaemonStatus()),
    mapTo(SystemInfoActions.empty())
)

const startGettingBlockchainInfoEpic = (action$: ActionsObservable<any>) => action$.pipe(
  ofType(SystemInfoActions.startGettingBlockchainInfo().type),
  // This action SHOULD only be dispatched once, return nothing!!!
  tap(() => resistanceCliService.startPollingBlockChainInfo()),
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
  startGettingDaemonInfoEpic(action$, state$),
  startGettingBlockchainInfoEpic(action$, state$)
)
