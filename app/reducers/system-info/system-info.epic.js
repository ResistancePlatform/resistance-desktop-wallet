// @flow
import { tap, mapTo, switchMap, catchError  } from 'rxjs/operators'
import { merge, of, from } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'
import { shell } from 'electron'
import rp from 'request-promise-native'
import log from 'electron-log'

import { Action } from '../types'
import { RPC } from '~/constants/rpc'
import { AUTH } from '~/constants/auth'
import { getInstallationPath } from '~/utils/os'
import { SystemInfoActions } from './system-info.reducer'
import { RpcService } from '~/service/rpc-service'
import { ResistanceService } from '~/service/resistance-service'

const rpcService = new RpcService()
const resistanceService = new ResistanceService()

const gitHubApiUrl = `https://api.github.com/graphql`
const lastReleaseQuery = (
  `query {` +
    `repository(owner:"ResistancePlatform", name:"resistance-platform-release") {` +
      `releases(last:1) {` +
        `edges {` +
          `node {` +
            `name,` +
            `url` +
          `}` +
        `}` +
      `}` +
    `}` +
  `}`
)

async function getLastRelease() {
  const jsonData = {
    query: lastReleaseQuery
  }

  const response = await rp({
    url: gitHubApiUrl,
    method: 'POST',
    headers: {
      'User-Agent': 'ResistanceWallet',
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v4.idl',
      'Authorization': 'Bearer 54e11fc01d9bc1ba343f61e0f4d95d8037caeb7f',
    },
    body: JSON.stringify(jsonData),
  })

  const result = JSON.parse(response)

  if (!result.data) {
    log.error(`GitHub response`, response, typeof response)
    throw Error(`Invalid response`)
  }

  const { edges } = result.data.repository.releases

  if (edges.length === 0) {
    throw Error(`No releases found`)
  }

  const { node } = edges[0]

  log.debug(`Last release:`, JSON.stringify(node))

  return node
}

// TODO: Get rid of the behaviour after the issue is fixed:
// https://github.com/ResistancePlatform/resistance-core/issues/94
function suppressRpcWarmupError(action, callable) {
  if (action.payload.code !== RPC.IN_WARMUP && action.payload.code !== 'ECONNREFUSED') {
    callable()
  } else {
    console.log(`Suppressing RPC initialization error display:`, action.payload)
  }
}

const getDaemonInfoEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(SystemInfoActions.getDaemonInfo.toString()),
  tap(() => rpcService.requestDaemonInfo()),
  mapTo(SystemInfoActions.empty())
)

const getDaemonInfoFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(SystemInfoActions.getDaemonInfoFailure.toString()),
  tap((action) => {
    suppressRpcWarmupError(action, () => toastr.error(action.payload.errorMessage))
  }),
  mapTo(SystemInfoActions.empty())
)

const getBlockchainInfoEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(SystemInfoActions.getBlockchainInfo.toString()),
  tap(() => rpcService.requestBlockchainInfo()),
  mapTo(SystemInfoActions.empty())
)

const getBlockchainInfoFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(SystemInfoActions.getBlockchainInfoFailure.toString()),
  tap((action) => {
    suppressRpcWarmupError(action, () => toastr.error(action.payload.errorMessage))
  }),
  mapTo(SystemInfoActions.empty())
)

const getOperationsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(SystemInfoActions.getOperations.toString()),
  tap(() => rpcService.requestOperations()),
  mapTo(SystemInfoActions.empty())
)

const getOperationsFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(SystemInfoActions.getOperationsFailure.toString()),
  tap((action) => {
    suppressRpcWarmupError(action, () => toastr.error(action.payload.errorMessage))
  }),
  mapTo(SystemInfoActions.empty())
)

const openWalletInFileManagerEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(SystemInfoActions.openWalletInFileManager.toString()),
  tap(() => {
    shell.openItem(resistanceService.getWalletPath())
  }),
  mapTo(SystemInfoActions.empty())
)

const openInstallationFolderEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(SystemInfoActions.openInstallationFolder.toString()),
  tap(() => {
    shell.openItem(getInstallationPath())
  }),
  mapTo(SystemInfoActions.empty())
)

const checkWalletUpdateEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(SystemInfoActions.checkWalletUpdate),
  switchMap(() => {
    const observable = from(getLastRelease()).pipe(
      switchMap(release => {
        const lastVersion = release.name.split(' ').pop()

        log.debug(`App Versions:`, lastVersion, AUTH.appVersion)

        // 2.2.9-1 Windows packaging issue hotfix
        if (lastVersion !== AUTH.appVersion && lastVersion !== '2.2.9') {
          return of(
            SystemInfoActions.openUpdateModal(release.name, release.url),
            SystemInfoActions.checkWalletUpdateSucceeded()
          )
        }

        return of(SystemInfoActions.checkWalletUpdateSucceeded())
      }),
      catchError(err => {
        log.error(`Can't get last release information`, err)
        return of(SystemInfoActions.checkWalletUpdateFailed())
      })
    )

    return observable
  })
)

export const SystemInfoEpics = (action$, state$) => merge(
  openWalletInFileManagerEpic(action$, state$),
  openInstallationFolderEpic(action$, state$),
  getDaemonInfoEpic(action$, state$),
  getDaemonInfoFailureEpic(action$, state$),
  getBlockchainInfoEpic(action$, state$),
  getBlockchainInfoFailureEpic(action$, state$),
  getOperationsEpic(action$, state$),
  getOperationsFailureEpic(action$, state$),
  checkWalletUpdateEpic(action$, state$)
)
