// @flow
import { map, tap } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { AppAction } from '../appAction'
import { SystemInfoActions } from './system-info.reducer'
import { ResistanceCliService } from '../../../service/resistance-cli-service'
import { LoggerService, ConsoleTheme } from '../../../service/logger-service'

const epicInstanceName = 'SystemInfoEpics'
const resistanceCliService = new ResistanceCliService()
const logger = new LoggerService()

const startGettingDaemonInfoEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(SystemInfoActions.START_GETTING_DAEMON_INFO),
    tap((action: AppAction) => logger.debug(epicInstanceName, `startGettingDaemonInfoEpic`, action.type, ConsoleTheme.testing)),
    tap(() => resistanceCliService.startPollingDaemonStatus()),
    map(() => SystemInfoActions.empty())
)

const startGettingBlockChainInfoEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(SystemInfoActions.START_GETTING_BLOCKCHAIN_INFO),
    tap((action: AppAction) =>logger.debug(epicInstanceName, `startGettingBlockChainInfoEpic`, action.type, ConsoleTheme.testing)),

    // This action SHOULD only be dispatched once, return nothing !!!
    tap(() => resistanceCliService.startPollingBlockChainInfo()),
    map(() => SystemInfoActions.empty())
)

export const SystemInfoEpics = (action$, store) => merge(
    startGettingDaemonInfoEpic(action$, store),
    startGettingBlockChainInfoEpic(action$, store)
)
