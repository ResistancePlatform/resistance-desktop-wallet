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

const loadBalancesEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OverviewActions.LOAD_BALANCES),
    tap((action: AppAction) => logger.debug(epicInstanceName, `loadBalancesEpic`, action.type, ConsoleTheme.testing)),
    switchMap(() => resistanceCliService.getBalance()),
    map(result => result ? OverviewActions.loadBalancesSuccess(result) : OverviewActions.loadBalancesFail('Cannot load balance.')),
    catchError(error => {
        // console.error(`error: `, error)
        const errorMessage = error.code && error.code === 'ECONNREFUSED' ? 'Cannot connect to "resistanced" service.' : error
        return of(OverviewActions.loadBalancesFail(errorMessage))
    })
)

const loadTransactionListEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OverviewActions.LOAD_TRANSACTION_LIST),
    tap((action: AppAction) => logger.debug(epicInstanceName, `loadTransactionListEpic`, action.type, ConsoleTheme.testing)),
    switchMap(() => resistanceCliService.getPublicTransactions()),
    map(result => result ? OverviewActions.loadTransactionListSuccess(result) : OverviewActions.loadTransactionListFail('Cannot load balance.')),
    catchError(error => {
        console.error(`error: `, error)
        const errorMessage = error.code && error.code === 'ECONNREFUSED' ? 'Cannot connect to "resistanced" service.' : error
        return of(OverviewActions.loadTransactionListFail(errorMessage))
    })
)


export const OverviewEpics = (action$, store) => merge(
    loadBalancesEpic(action$, store),
    loadTransactionListEpic(action$, store),
)
