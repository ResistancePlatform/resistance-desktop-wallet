// @flow
import moment from 'moment'
import fs from 'fs'
import log from 'electron-log'
import { remote } from 'electron'
import {
  tap,
  map,
  switchMap,
  catchError,
  mapTo
} from 'rxjs/operators'
import {
  of,
  concat,
  merge,
  bindCallback,
} from 'rxjs'
import { translate } from '~/i18next.config'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'
import { routerActions } from 'react-router-redux'

import { Action } from '../types'
import { OverviewActions } from './overview.reducer'
import { RpcService } from '~/service/rpc-service'

const t = translate('overview')
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

const getTransactionDetailsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OverviewActions.getTransactionDetails),
  switchMap(action => rpc.getTransactionDetails(action.payload.transactionId)),
  switchMap(transactionDetails => {
    if (typeof transactionDetails !== 'object') {
      log.error(`Can't get transaction details`, transactionDetails)
      toastr.error(`Error getting transaction details`)
      return of(OverviewActions.getTransactionDetailsFailed())
    }

    log.debug(`Got transaction details`, transactionDetails)
    return concat(
      of(OverviewActions.gotTransactionDetails(transactionDetails)),
      of(routerActions.push('/overview/transaction-details'))
    )
  })
)

const initiateExportToCsvEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OverviewActions.initiateExportToCsv),
  switchMap(() => {
    const showSaveDialogObservable = bindCallback(remote.dialog.showSaveDialog.bind(remote.dialog))

    const title = t(`Export transactions to CSV`)
    const params = {
      title,
      defaultPath: remote.app.getPath('documents'),
      message: title,
      nameFieldLabel: t(`File name:`),
      filters: [{ name: t(`Comma-Separated Values (CSV) `),  extensions: ['csv'] }]
    }

    const observable = showSaveDialogObservable(params).pipe(
      switchMap(([ filePath ]) => (
        filePath
          ? of(OverviewActions.exportToCsv(filePath))
          : of(OverviewActions.empty())
      )),
      catchError(() => of(OverviewActions.empty()))
    )

    return observable
  })
)

const exportToCsvEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
  ofType(OverviewActions.exportToCsv),
  switchMap(action => {
    const { transactions } = state$.value.overview

    const titles = [
      t(`Time`),
      t(`Type`),
      t(`Direction`),
      t(`Confirmations`),
      t(`Amount`),
      t(`Destination address`),
      t(`Transaction ID`),
    ]

    const writeFileObservable = bindCallback(fs.writeFile.bind(fs))

    let csvData = titles.join(',').concat('\r\n')

    csvData = csvData.concat(
      transactions.map(transaction => [
        moment.unix(transaction.timestamp).toISOString(),
        transaction.type,
        transaction.category,
        transaction.confirmations,
        transaction.amount.toString(),
        transaction.destinationAddress,
        transaction.transactionId,
      ].join(',')).join('\r\n')
    )

    const observable = writeFileObservable(action.payload.filePath, csvData, 'utf8').pipe(
      switchMap(() => {
        toastr.success(t(`CSV export completed.`))
        return of(OverviewActions.empty())
      }),
      catchError(err => {
        log.error(`Can't export to CSV`, err)
        toastr.error(t(`Error exporting to CSV, check the log for details.`))
        return of(OverviewActions.empty())
      })
    )

    return observable
  })
)

export const OverviewEpics = (action$, state$) => merge(
    getWalletInfoEpic(action$, state$),
    getWalletInfoFailureEpic(action$, state$),
    getTransactionDataFromWalletEpic(action$, state$),
    getTransactionDataDromWalletFailureEpic(action$, state$),
    getTransactionDetailsEpic(action$, state$),
    initiateExportToCsvEpic(action$, state$),
    exportToCsvEpic(action$, state$),
)
