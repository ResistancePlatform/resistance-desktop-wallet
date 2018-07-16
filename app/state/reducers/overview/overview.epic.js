// @flow
import { remote } from 'electron'
import { map, tap, switchMap, catchError } from 'rxjs/operators'
import { merge, of } from 'rxjs'

import { ActionsObservable, ofType } from 'redux-observable'
// import { Store } from 'redux'
import { AppAction } from '../appAction'

import { OverviewActions } from './overview.reducer'
import { ResistanceCliService } from '../../../service/resistance-cli-service'
import { DialogService } from '../../../service/dialog-service'

// const logger = LoggerService.getInstance()
// const service = DataProxyService.getInstance()
const epicInstanceName = 'OverviewEpics'
const resistanceCliService = new ResistanceCliService()
const dialogService = new DialogService()

const loadBalancesEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OverviewActions.LOAD_BALANCES),
    // tap(action => logger.debug(`${epicInstanceName}`, `loadTopListEpic`, `action:`, ConsoleTheme.testing, action)),
    tap((action: AppAction) => console.log(`[ ${epicInstanceName} ] - loadBalancesEpic, ${action.type}`)),
    switchMap(() => resistanceCliService.getBalance()),
    map(result => result ? OverviewActions.loadBalancesSuccess(result) : OverviewActions.loadBalancesFail('Cannot load balance.')),
    catchError(error => {
        // console.error(`error: `, error)
        const errorMessage = error.code && error.code === 'ECONNREFUSED' ? 'Cannot connect to "resistanced" service.' : error
        return of(OverviewActions.loadBalancesFail(errorMessage))
    })
)

const loadBalancesFailEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OverviewActions.LOAD_BALANCES_FAIL),
    tap(action => setTimeout(() => dialogService.showError(action.payload), 100)),
    map(() => of(OverviewActions.empty()))
)

const loadTransactionListEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OverviewActions.LOAD_TRANSACTION_LIST),
    // tap(action => logger.debug(`${epicInstanceName}`, `loadTopListEpic`, `action:`, ConsoleTheme.testing, action)),
    tap((action: AppAction) => console.log(`[ ${epicInstanceName} ] - loadTransactionListEpic, ${action.type}`)),
    switchMap(() => resistanceCliService.getPublicTransactions()),
    map(result => result ? OverviewActions.loadTransactionListSuccess(result) : OverviewActions.loadTransactionListFail('Cannot load balance.')),
    catchError(error => {
        console.error(`error: `, error)
        const errorMessage = error.code && error.code === 'ECONNREFUSED' ? 'Cannot connect to "resistanced" service.' : error
        return of(OverviewActions.loadTransactionListFail(errorMessage))
    })
)

const loadTransactionListFailEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OverviewActions.LOAD_TRANSACTION_LIST_FAIL),
    tap(action => setTimeout(() => dialogService.showError(action.payload), 100)),
    map(() => of(OverviewActions.empty()))
)


export const OverviewEpics = (action$, store) => merge(
    loadBalancesEpic(action$, store),
    loadBalancesFailEpic(action$, store),
    loadTransactionListEpic(action$, store),
    loadTransactionListFailEpic(action$, store)
)
