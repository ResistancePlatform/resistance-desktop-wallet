// @flow
import { map, switchMap } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { OwnAddressesActions } from './own-addresses.reducer'
import { ResistanceCliService } from '../../../service/resistance-cli-service'

const resistanceCliService = new ResistanceCliService()

const getOwnAddressesEpic = (action$: ActionsObservable<any>) => action$.pipe(
    ofType(OwnAddressesActions.getOwnAddresses().type),
    switchMap(() => resistanceCliService.getWalletAddressAndBalance(false)),
    map(result => OwnAddressesActions.getOwnAddressesSuccess(result))
)

const createNewAddressesEpic = (action$: ActionsObservable<any>) => action$.pipe(
    ofType(OwnAddressesActions.createNewAddress(true).type),
    switchMap((action) => resistanceCliService.createNewAddress(action.payload.isPrivate)),
    map(result => result && result !== '' ? OwnAddressesActions.getOwnAddresses() : OwnAddressesActions.empty())
)

export const OwnAddressesEpics = (action$, state$) => merge(
    getOwnAddressesEpic(action$, state$),
    createNewAddressesEpic(action$, state$)
)
