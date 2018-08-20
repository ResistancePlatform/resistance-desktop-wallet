// @flow
import { tap, map, mapTo, switchMap } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { OwnAddressesActions } from './own-addresses.reducer'

import { AppAction } from '../appAction'
import { RpcService } from '../../../service/rpc-service'

const rpcService = new RpcService()

const getOwnAddressesEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
  ofType(OwnAddressesActions.getOwnAddresses.toString()),
  tap(() => { rpcService.requestOwnAddresses() }),
  mapTo(OwnAddressesActions.empty())
)

const createNewAddressesEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
  ofType(OwnAddressesActions.createNewAddress.toString()),
  switchMap((action) => rpcService.createNewAddress(action.payload.isPrivate)),
  map(result => result ? OwnAddressesActions.getOwnAddresses() : OwnAddressesActions.empty())
)

export const OwnAddressesEpics = (action$, state$) => merge(
  getOwnAddressesEpic(action$, state$),
  createNewAddressesEpic(action$, state$)
)
