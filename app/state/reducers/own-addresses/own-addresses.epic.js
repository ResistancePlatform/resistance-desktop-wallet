// @flow
import { map, tap } from 'rxjs/operators'
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
    tap(() => resistanceCliService.getWalletOwnAddresses()),
    map(() => OwnAddressesActions.empty())
)

export const OwnAddressesEpics = (action$, state$) => merge(
    getOwnAddressesEpic(action$, state$),
)
