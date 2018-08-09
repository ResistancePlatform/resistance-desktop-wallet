// @flow
import { tap, mapTo } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'

import { SystemInfoActions } from './system-info.reducer'
import { ResistanceCliService } from '../../../service/resistance-cli-service'

const resistanceCliService = new ResistanceCliService()

const startGettingDaemonInfoEpic = (action$: ActionsObservable<any>) => action$.pipe(
    ofType(SystemInfoActions.startGettingDaemonInfo().type),
    tap(() => resistanceCliService.startPollingDaemonStatus()),
    mapTo(SystemInfoActions.empty())
)

const startGettingBlockchainInfoEpic = (action$: ActionsObservable<any>) => action$.pipe(
    ofType(SystemInfoActions.startGettingBlockchainInfo().type),
    // This action SHOULD only be dispatched once, return nothing!!!
    tap(() => resistanceCliService.startPollingBlockChainInfo()),
    mapTo(SystemInfoActions.empty())
)

export const SystemInfoEpics = (action$, store) => merge(
    startGettingDaemonInfoEpic(action$, store),
    startGettingBlockchainInfoEpic(action$, store)
)
