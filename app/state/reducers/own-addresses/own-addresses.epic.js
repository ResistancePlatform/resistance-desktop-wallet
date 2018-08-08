// @flow
import { map, tap, switchMap } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { AppAction } from '../appAction'
import { OwnAddressesActions } from './own-addresses.reducer'
import { ResistanceCliService } from '../../../service/resistance-cli-service'
import { LoggerService, ConsoleTheme } from '../../../service/logger-service'

const epicInstanceName = 'OwnAddressesEpics'
const resistanceCliService = new ResistanceCliService()
const logger = new LoggerService()

const getOwnAddressesEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OwnAddressesActions.GET_OWN_ADDRESSES),
    tap((action: AppAction) => logger.debug(epicInstanceName, `getOwnAddressesEpic`, action.type, ConsoleTheme.testing)),
    switchMap(() => resistanceCliService.getWalletAddressAndBalance()),
    map(result => OwnAddressesActions.getOwnAddressesSuccess(result))
)

const createNewAddressesEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OwnAddressesActions.CREATE_NEW_ADDRESS),
    tap((action: AppAction) => logger.debug(epicInstanceName, `createNewAddressesEpic`, action.type, ConsoleTheme.testing)),
    switchMap((action: AppAction) => resistanceCliService.createNewAddress(action.payload)),
    map(result => result && result !== '' ? OwnAddressesActions.getOwnAddresses() : OwnAddressesActions.empty())
)

export const OwnAddressesEpics = (action$, state$) => merge(
    getOwnAddressesEpic(action$, state$),
    createNewAddressesEpic(action$, state$)
)
