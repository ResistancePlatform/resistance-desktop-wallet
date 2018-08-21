// @flow
import { tap, map, mapTo, switchMap } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { OwnAddressesActions } from './own-addresses.reducer'
import { AppAction } from '../appAction'
import { RpcService } from '../../../service/rpc-service'

const rpcService = new RpcService()

const getOwnAddressesEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
  ofType(OwnAddressesActions.getOwnAddresses),
  tap(() => { rpcService.requestOwnAddresses() }),
  mapTo(OwnAddressesActions.empty())
)

const createNewAddressesEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
  ofType(OwnAddressesActions.createNewAddress),
  switchMap((action) => rpcService.createNewAddress(action.payload.isPrivate)),
  map(result => result ? OwnAddressesActions.getOwnAddresses() : OwnAddressesActions.empty())
)

const mergeAllMinedCoinsEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
  ofType(OwnAddressesActions.mergeAllMinedCoins),
  tap(action => {
    toastr.info(`Merge all mined coins operation started.`)
    rpcService.mergeAllMinedCoins(action.payload.zAddress)
  }),
  mapTo(OwnAddressesActions.empty())
)

export const OwnAddressesEpics = (action$, state$) => merge(
  getOwnAddressesEpic(action$, state$),
  createNewAddressesEpic(action$, state$),
  mergeAllMinedCoinsEpic(action$, state$)
)
