// @flow
import { tap, mapTo, switchMap } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { OwnAddressesActions } from './own-addresses.reducer'
import { ResistanceCliService } from '../../../service/resistance-cli-service'

const rpcService = new ResistanceCliService()

const startGettingOwnAddressesEpic = (action$: ActionsObservable<any>) => action$.pipe(
  ofType(OwnAddressesActions.startGettingOwnAddresses().type),
  tap(() => { rpcService.startGettingOwnAddresses() }),
  mapTo(OwnAddressesActions.empty())
)

const stopGettingOwnAddressesEpic = (action$: ActionsObservable<any>) => action$.pipe(
  ofType(OwnAddressesActions.stopGettingOwnAddresses().type),
  tap(() => { rpcService.stopGettingOwnAddresses() }),
  mapTo(OwnAddressesActions.empty())
)

const createNewAddressesEpic = (action$: ActionsObservable<any>) => action$.pipe(
  ofType(OwnAddressesActions.createNewAddress(true).type),
  switchMap((action) => rpcService.createNewAddress(action.payload.isPrivate)),
  mapTo(OwnAddressesActions.empty())
)

export const OwnAddressesEpics = (action$, state$) => merge(
  startGettingOwnAddressesEpic(action$, state$),
  stopGettingOwnAddressesEpic(action$, state$),
  createNewAddressesEpic(action$, state$)
)
