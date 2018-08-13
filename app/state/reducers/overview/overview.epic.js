// @flow
import { map, tap, switchMap } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { AppAction } from '../appAction'
import { OverviewActions } from './overview.reducer'
import { ResistanceCliService } from '../../../service/resistance-cli-service'
import { LoggerService, ConsoleTheme } from '../../../service/logger-service'

const epicInstanceName = 'OverviewEpics'
const resistanceCliService = new ResistanceCliService()
const logger = new LoggerService()

const startGettingWalletInfoEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OverviewActions.startGettingWalletInfo),
    tap((action: AppAction) => logger.debug(epicInstanceName, `startGettingWalletInfoEpic`, action.type, ConsoleTheme.testing)),
    tap(() => resistanceCliService.startPollingWalletInfo()),
    map(() => OverviewActions.empty())
)

const stopGettingWalletInfoEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OverviewActions.stopGettingWalletInfo),
    tap((action: AppAction) => logger.debug(epicInstanceName, `stopGettingWalletInfoEpic`, action.type, ConsoleTheme.testing)),
    tap(() => resistanceCliService.stopPollingWalletInfo()),
    map(() => OverviewActions.empty())
)

const startGettingTransactionDataFromWalletEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OverviewActions.startGettingTransactionDataFromWallet),
    tap((action: AppAction) => logger.debug(epicInstanceName, `startGettingTransactionDataFromWalletEpic`, action.type, ConsoleTheme.testing)),
    tap(() => resistanceCliService.startPollingTransactionsDataFromWallet()),
    map(() => OverviewActions.empty())
)

const stopGettingTransactionDataFromWalletEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OverviewActions.stopGettingTransactionDataFromWallet),
    tap((action: AppAction) => logger.debug(epicInstanceName, `stopGettingTransactionDataFromWalletEpic`, action.type, ConsoleTheme.testing)),
    tap(() => resistanceCliService.stopPollingTransactionsDataFromWallet()),
    map(() => OverviewActions.empty())
)

const showTransactionDetailEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OverviewActions.showTransactionDetail),
    tap((action: AppAction) => logger.debug(epicInstanceName, `showTransactionDetailEpic`, action.type, ConsoleTheme.testing)),
    switchMap((action) => resistanceCliService.getTransactionDetail(action.payload))
)



export const OverviewEpics = (action$, state$) => merge(
    startGettingWalletInfoEpic(action$, state$),
    stopGettingWalletInfoEpic(action$, state$),
    startGettingTransactionDataFromWalletEpic(action$, state$),
    stopGettingTransactionDataFromWalletEpic(action$, state$),
    showTransactionDetailEpic(action$, state$)
)
