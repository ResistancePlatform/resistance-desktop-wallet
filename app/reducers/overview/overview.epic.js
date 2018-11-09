// @flow
import { tap, map, switchMap, mapTo } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { Action } from '../types'
import { OverviewActions } from './overview.reducer'
import { RpcService } from '~/service/rpc-service'

const rpc = new RpcService()

const getWalletInfoEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OverviewActions.getWalletInfo),
  tap(() => rpc.requestWalletInfo()),
  map(() => OverviewActions.empty())
)

const getWalletInfoFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OverviewActions.getWalletInfoFailure),
  tap((action) => toastr.error(action.payload.errorMessage)),
  mapTo(OverviewActions.empty())
)

const getTransactionDataFromWalletEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OverviewActions.getTransactionDataFromWallet),
  tap(() => rpc.requestTransactionsDataFromWallet()),
  mapTo(OverviewActions.empty())
)

const getTransactionDataDromWalletFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OverviewActions.getTransactionDataFromWalletFailure),
  tap((action) => toastr.error(action.payload.errorMessage)),
  mapTo(OverviewActions.empty())
)

const showTransactionDetailsEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
  ofType(OverviewActions.showTransactionDetails),
  switchMap(action => {
    const overviewState = state$.value.overview
    return rpc.getTransactionDetails(action.payload.transactionId)
  }),
  map(
    result => typeof result === 'object'
      ? OverviewActions.showTransactionDetailsSucceeded(result)
      : OverviewActions.showTransactionDetailsFailed(result)
  )
)

export const OverviewEpics = (action$, state$) => merge(
    getWalletInfoEpic(action$, state$),
    getWalletInfoFailureEpic(action$, state$),
    getTransactionDataFromWalletEpic(action$, state$),
    getTransactionDataDromWalletFailureEpic(action$, state$),
    showTransactionDetailsEpic(action$, state$)
)
