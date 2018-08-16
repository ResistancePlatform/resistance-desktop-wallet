// @flow
import { map, tap, switchMap } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { AppAction } from '../appAction'
import { OverviewActions } from './overview.reducer'
import { ResistanceCliService } from '../../../service/resistance-cli-service'

const rpcService = new ResistanceCliService()

const getWalletInfoEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OverviewActions.getWalletInfo),
    tap(() => rpcService.requestWalletInfo()),
    map(() => OverviewActions.empty())
)

const getTransactionDataFromWalletEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
    ofType(OverviewActions.getTransactionDataFromWallet),
    tap(() => rpcService.requestTransactionsDataFromWallet()),
    map(() => OverviewActions.empty())
)

const showTransactionDetailEpic = (action$: ActionsObservable<AppAction>, state$) => action$.pipe(
    ofType(OverviewActions.showTransactionDetail),
    switchMap(() => {
        const overviewState = state$.value.overview
        return rpcService.getTransactionDetail(overviewState.popupMenu.popupTransactionId)
    }),
    map(result => typeof result === 'object' ? OverviewActions.showTransactionDetailSuccess(result) : OverviewActions.showTransactionDetailFail(result))
)

export const OverviewEpics = (action$, state$) => merge(
    getWalletInfoEpic(action$, state$),
    getTransactionDataFromWalletEpic(action$, state$),
    showTransactionDetailEpic(action$, state$)
)
