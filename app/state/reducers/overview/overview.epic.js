// @flow
import {
    map,
    tap,
    switchMap,
    catchError
} from 'rxjs/operators'
import {
    merge,
    of
} from 'rxjs'

import { ActionsObservable } from 'redux-observable'
// import { Store } from 'redux'
import { AppAction } from '../appAction'

import { OverviewActions } from './overview.reducer'
import { ResistanceCliService } from '../../../service/resistance-cli-service'

// const logger = LoggerService.getInstance()
// const service = DataProxyService.getInstance()
const epicInstanceName = 'OverviewEpics'
const resistanceCliService = new ResistanceCliService();

const loadBalancesEpic = (action$: ActionsObservable<AppAction>) => action$
    .ofType(OverviewActions.LOAD_BALANCES)
    // .do(action => logger.debug(`${epicInstanceName}`, `loadTopListEpic`, `action:`, ConsoleTheme.testing, action))
    .pipe(
        tap((action: AppAction) => console.log(`[ ${epicInstanceName} ] - loadBalancesEpic, ${action.type}`)),
        switchMap(() => resistanceCliService.geBalance()),
        map(result => result ? OverviewActions.loadBalancesSuccess(result) : OverviewActions.loadBalancesFail('Cannot load balance.')),
        catchError(error => of(OverviewActions.loadBalancesFail(error)))
    )

export const OverviewEpics = (action$, store) => merge(
    loadBalancesEpic(action$, store)
)
