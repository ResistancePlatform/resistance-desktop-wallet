// @flow
import { mapTo, switchMap } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { OwnAddressesActions } from './own-addresses.reducer'
import { ResistanceCliService } from '../../../service/resistance-cli-service'

const rpcService = new ResistanceCliService()

const createNewAddressesEpic = (action$: ActionsObservable<any>) => action$.pipe(
    ofType(OwnAddressesActions.createNewAddress(true).type),
    switchMap((action) => rpcService.createNewAddress(action.payload.isPrivate)),
    mapTo(OwnAddressesActions.empty())
)

export const OwnAddressesEpics = (action$, state$) => merge(
    createNewAddressesEpic(action$, state$)
)
