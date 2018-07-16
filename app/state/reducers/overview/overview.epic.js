// @flow
import { map, tap, switchMap, catchError } from 'rxjs/operators'
import { merge, of } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { AppAction } from '../appAction'
import { OverviewActions } from './overview.reducer'
import { ResistanceCliService } from '../../../service/resistance-cli-service'
import { LoggerService, ConsoleTheme } from '../../../service/logger-service'

const epicInstanceName = 'OverviewEpics'
const resistanceCliService = new ResistanceCliService()
const logger = new LoggerService()

const startGettingWalletInfoEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OverviewActions.START_GETTING_WALLET_INFO),
    tap((action: AppAction) => logger.debug(epicInstanceName, `startGettingWalletInfoEpic`, action.type, ConsoleTheme.testing)),
    tap(() => resistanceCliService.startPollingWalletInfo()),
    map(result => OverviewActions.gotWalletInfo(result))
)

const loadTransactionListEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OverviewActions.LOAD_TRANSACTION_LIST),
    tap((action: AppAction) => logger.debug(epicInstanceName, `loadTransactionListEpic`, action.type, ConsoleTheme.testing)),
    switchMap(() => resistanceCliService.getPublicTransactions()),
    map(result => result ? OverviewActions.loadTransactionListSuccess(result) : OverviewActions.loadTransactionListFail('Cannot get transaction data from wallet.')),
    catchError(error => {
        console.error(`error: `, error)
        const errorMessage = error.code && error.code === 'ECONNREFUSED' ? 'Cannot connect to "resistanced" service.' : error
        return of(OverviewActions.loadTransactionListFail(errorMessage))
    })
)


export const OverviewEpics = (action$, store) => merge(
    startGettingWalletInfoEpic(action$, store),
    loadTransactionListEpic(action$, store),
)
