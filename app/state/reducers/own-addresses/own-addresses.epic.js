// @flow
import { tap, map, mapTo, switchMap } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { SystemInfoActions } from '../system-info/system-info.reducer'
import { OwnAddressesActions } from './own-addresses.reducer'
import { Action } from '../types'
import { RpcService } from '../../../service/rpc-service'

const rpcService = new RpcService()

const getOwnAddressesEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.getOwnAddresses),
  tap(() => { rpcService.requestOwnAddresses() }),
  mapTo(OwnAddressesActions.empty())
)

const createNewAddressesEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.createNewAddress),
  switchMap((action) => rpcService.createNewAddress(action.payload.isPrivate)),
  map(result => result ? OwnAddressesActions.getOwnAddresses() : OwnAddressesActions.empty())
)

const mergeAllMinedCoinsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeAllMinedCoins),
  tap(action => {
    rpcService.mergeAllMinedCoins(action.payload.zAddress)
  }),
  mapTo(SystemInfoActions.newOperationTriggered())
)

const mergeAllRAddressCoinsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeAllRAddressCoins),
  tap(action => {
    rpcService.mergeAllRAddressCoins(action.payload.zAddress)
  }),
  mapTo(SystemInfoActions.newOperationTriggered())
)

const mergeAllZAddressCoinsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeAllZAddressCoins),
  tap(action => {
    rpcService.mergeAllZAddressCoins(action.payload.zAddress)
  }),
  mapTo(SystemInfoActions.newOperationTriggered())
)

const mergeAllCoinsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeAllCoins),
  tap(action => {
    rpcService.mergeAllCoins(action.payload.zAddress)
  }),
  mapTo(SystemInfoActions.newOperationTriggered())
)

const mergeCoinsOperationStartedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeCoinsOperationStarted),
  tap(() => {
    toastr.info(`Merging operation started, addresses will be frozen until done.`)
  }),
  mapTo(SystemInfoActions.getOperations())
)

const mergeCoinsFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeCoinsFailure),
  tap((action) => {
    toastr.error(`Unable to start merge operation`, action.payload.errorMessage)
  }),
  mapTo(SystemInfoActions.empty())
)

export const OwnAddressesEpics = (action$, state$) => merge(
  getOwnAddressesEpic(action$, state$),
  createNewAddressesEpic(action$, state$),
  mergeAllMinedCoinsEpic(action$, state$),
  mergeAllRAddressCoinsEpic(action$, state$),
  mergeAllZAddressCoinsEpic(action$, state$),
  mergeAllCoinsEpic(action$, state$),
  mergeCoinsOperationStartedEpic(action$, state$),
  mergeCoinsFailureEpic(action$, state$)
)
