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
    map(() => OverviewActions.empty())
)

const startGettingTransactionDataFromWalletEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OverviewActions.START_GETTING_TRANSACTION_DATA_FROM_WALLET),
    tap((action: AppAction) => logger.debug(epicInstanceName, `startGettingTransactionDataFromWalletEpic`, action.type, ConsoleTheme.testing)),
    tap(() => resistanceCliService.startPollingTransactionsDataFromWallet()),
    map(() => OverviewActions.empty())
)


export const OverviewEpics = (action$, store) => merge(
    startGettingWalletInfoEpic(action$, store),
    startGettingTransactionDataFromWalletEpic(action$, store),
)
