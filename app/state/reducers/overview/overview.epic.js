// @flow
import { tap, map, switchMap, mapTo } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { AppAction } from '../appAction'
import { OverviewActions } from './overview.reducer'
import { RpcService } from '../../../service/rpc-service'

const rpcService = new RpcService()

const getWalletInfoEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
  ofType(OverviewActions.getWalletInfo),
  tap(() => rpcService.requestWalletInfo()),
  map(() => OverviewActions.empty())
)

const getWalletInfoFailureEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
  ofType(OverviewActions.getWalletInfoFailure),
  tap((action) => toastr.error(action.payload.errorMessage)),
  mapTo(OverviewActions.empty())
)

const getTransactionDataFromWalletEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
  ofType(OverviewActions.getTransactionDataFromWallet),
  tap(() => rpcService.requestTransactionsDataFromWallet()),
  map(() => OverviewActions.empty())
)

const getTransactionDataDromWalletFailureEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
  ofType(OverviewActions.getTransactionDataDromWalletFailure),
  tap((action) => toastr.error(action.payload.errorMessage)),
  mapTo(OverviewActions.empty())
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
    getWalletInfoFailureEpic(action$, state$),
    getTransactionDataFromWalletEpic(action$, state$),
    getTransactionDataDromWalletFailureEpic(action$, state$),
    showTransactionDetailEpic(action$, state$)
)
