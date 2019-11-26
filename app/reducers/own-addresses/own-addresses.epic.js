// @flow
import { remote } from 'electron'
import { tap, map, mapTo, mergeMap, switchMap, catchError } from 'rxjs/operators'
import { of, bindCallback, from, merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'
import LedgerRes from 'ledger-res'
import Client from 'bitcoin-core'
import log from 'electron-log'
import winston from 'winston'

import { i18n } from '~/i18next.config'
import { getEnsureLoginObservable } from '~/utils/auth'
import { SystemInfoActions } from '../system-info/system-info.reducer'
import { OwnAddressesActions } from './own-addresses.reducer'
import { Action } from '../types'
import { RpcService } from '~/service/rpc-service'

const t = i18n.getFixedT(null, 'own-addresses')
const rpc = new RpcService()
let ledgerRpcClient
let ledgerRes


(async () => {
  try {

    const logger = winston.createLogger({
      level: 'error',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console({ format: winston.format.json() })
      ]
    });

    const nodeConfig = remote.getGlobal('resistanceNodeConfig')

    let network

    if (nodeConfig.testnet) {
      network = 'testnet'
    } else if (nodeConfig.regtest) {
      network = 'regtest'
    }

    ledgerRpcClient = new Client({
      network,
      host: '127.0.0.1',
      port: nodeConfig.rpcport,
      username: nodeConfig.rpcuser,
      password: nodeConfig.rpcpassword,
      logger,
      timeout: 10000
    })

     ledgerRes = new LedgerRes(ledgerRpcClient)


  } catch (err) {
    console.log(err)
  }

})()

const getOwnAddressesEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.getOwnAddresses),
  switchMap(() => {
    const observable = from(rpc.getMyAddresses()).pipe(
      switchMap(addresses => of(OwnAddressesActions.gotOwnAddresses(addresses))),
      catchError(err => {
        log.error(`Can't get my addresses:`, err)
        return of(OwnAddressesActions.getOwnAddressesFailure(t(`Error getting the address list`)))
      })
    )
    return observable
  })
)

const createAddressEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.createAddress),
  switchMap(action => rpc.createNewAddress(action.payload.isPrivate)),
  map(address => {
    toastr.success(t(`Address {{address}} created successfully`, { address }))
    return OwnAddressesActions.getOwnAddresses()
  }),
  catchError(err => {
    log.error(`Can't create a new address`, err)
    toastr.error(`Unable to create new address, check the log for details`)
    return of(OwnAddressesActions.empty())
  }),
)

const initiatePrivateKeysExportEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(OwnAddressesActions.initiatePrivateKeysExport),
  mergeMap(() => {
    const showSaveDialogObservable = bindCallback(remote.dialog.showSaveDialog.bind(remote.dialog))

    const title = t(`Export Resistance addresses private keys to a file`)
    const params = {
      title,
      defaultPath: remote.app.getPath('documents'),
      message: title,
      nameFieldLabel: t(`File name:`),
      filters: [{ name: t(`Keys files`),  extensions: ['keys'] }]
    }

    const observable = showSaveDialogObservable(params).pipe(
      switchMap(([ filePath ]) => (
        filePath
          ? of(OwnAddressesActions.exportPrivateKeys(filePath))
          : of(OwnAddressesActions.empty())
      )))

    return getEnsureLoginObservable(null, observable, action$)
  })
)

const exportPrivateKeysEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(OwnAddressesActions.exportPrivateKeys),
  mergeMap(action => (
    rpc.exportPrivateKeys(action.payload.filePath).pipe(
      switchMap(() => {
        toastr.success(t(`Private keys exported successfully`))
        return of(OwnAddressesActions.empty())
      }),
      catchError(err => {
        toastr.error(t(`Unable to export private keys`), err.message)
        return of(OwnAddressesActions.empty())
      })
  )))
)

const initiatePrivateKeyImportEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(OwnAddressesActions.initiatePrivateKeyImport),
  mergeMap(() => (
    getEnsureLoginObservable(null, of(OwnAddressesActions.showImportPrivateKeyModal()), action$)
  ))
)

const importPrivateKeyEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(OwnAddressesActions.importPrivateKey),
  mergeMap(() => {
    const { privateKey } = state$.value.roundedForm.ownAddressesImportPrivateKeyModal.fields
    log.debug(`Importing private key`, privateKey)

    const observable = from(rpc.importPrivateKey(privateKey)).pipe(
      switchMap(() => {
        log.debug(`Imported private key`, privateKey)
        toastr.success(
          t(`Private key imported successfully`),
          t(`It may take several minutes to rescan the blockchain for transactions affecting the newly-added keys.`)
        )
        return of(
          OwnAddressesActions.importPrivateKeyFinished(),
          OwnAddressesActions.closeImportPrivateKeyModal()
        )
      }),
      catchError(err => {
        toastr.error(t(`Unable to import private key`), err.message)
        return of(OwnAddressesActions.importPrivateKeyFinished())
      })
    )

    return observable
  })
)

const initiatePrivateKeysImportEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(OwnAddressesActions.initiatePrivateKeysImport),
  mergeMap(() => {
    const showOpenDialogObservable = bindCallback(remote.dialog.showOpenDialog.bind(remote.dialog))

    const title = t(`Import Resistance addresses from private keys file`)
    const params = {
      title,
      defaultPath: remote.app.getPath('documents'),
      message: title,
      filters: [{ name: t(`Keys files`),  extensions: ['keys'] }]
    }

    const observable = showOpenDialogObservable(params).pipe(
      switchMap(([ filePaths ]) => (
        filePaths && filePaths.length
          ? of(OwnAddressesActions.importPrivateKeys(filePaths.pop()))
          : of(OwnAddressesActions.empty())
      )))

    return getEnsureLoginObservable(null, observable, action$)
  })
)

const importPrivateKeysEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(OwnAddressesActions.importPrivateKeys),
  mergeMap(action => (
    rpc.importPrivateKeys(action.payload.filePath).pipe(
      switchMap(() => {
        toastr.success(
          t(`Private keys imported successfully`),
          t(`It may take several minutes to rescan the blockchain for transactions affecting the newly-added keys.`)
        )
        return of(OwnAddressesActions.empty())
      }),
      catchError(err => {
        toastr.error(t(`Unable to import private keys`), err.message)
        return of(OwnAddressesActions.empty())
      })
  )))
)


const mergeAllMinedCoinsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeAllMinedCoins),
  tap(action => {
    rpc.mergeAllMinedCoins(action.payload.zAddress)
  }),
  mapTo(SystemInfoActions.newOperationTriggered())
)

const mergeAllRAddressCoinsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeAllRAddressCoins),
  tap(action => {
    rpc.mergeAllRAddressCoins(action.payload.zAddress)
  }),
  mapTo(SystemInfoActions.newOperationTriggered())
)

const mergeAllZAddressCoinsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeAllZAddressCoins),
  tap(action => {
    rpc.mergeAllZAddressCoins(action.payload.zAddress)
  }),
  mapTo(SystemInfoActions.newOperationTriggered())
)

const mergeAllCoinsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeAllCoins),
  tap(action => {
    rpc.mergeAllCoins(action.payload.zAddress)
  }),
  mapTo(SystemInfoActions.newOperationTriggered())
)

const mergeCoinsOperationStartedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeCoinsOperationStarted),
  tap(() => {
    toastr.info(t(`Merging operation started, addresses will be frozen until done.`))
  }),
  mapTo(SystemInfoActions.getOperations())
)

const mergeCoinsFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.mergeCoinsFailure),
  tap((action) => {
    toastr.error(t(`Unable to start merge operation`), action.payload.errorMessage)
  }),
  mapTo(SystemInfoActions.empty())
)

const isLedgerConnectedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.getLedgerConnected),
  switchMap(async () => {
    try {
      if(await ledgerRes.isAvailable()){
        const result = await ledgerRes.getPublicKey(0)
        const balance = await ledgerRes.getLedgerAddressBalance(result.bitcoinAddress)
        return OwnAddressesActions.gotLedgerResistanceAppOpen(result.bitcoinAddress, balance.toString())
      }

      return OwnAddressesActions.getLedgerConnectedFailure()
    } catch (err) {
      console.log(err.toString())
      if(err.toString().includes("cannot open device with path") || err.toString().includes("TransportStatusError: Ledger device: Security not satisfied (dongle locked or have invalid access rights)")){
        return OwnAddressesActions.gotLedgerConnected()
      }
      return OwnAddressesActions.getLedgerConnectedFailure()
    }
  })
)

const sendLedgerTransactionEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
  ofType(OwnAddressesActions.sendLedgerTransaction),
  switchMap(async () => {
    try {
      if(await ledgerRes.isAvailable()){
        const state = state$.value.ownAddresses.connectLedgerModal

        const signedTransaction = await ledgerRes.sendCoins(state.destinationAddress, 0, 0.0001, state.destinationAmount.toNumber())
        console.log(signedTransaction)
        const sentTransaction = await ledgerRes.sendRawTransaction(signedTransaction)
        console.log(sentTransaction)
        // return { type: "APP/OWN_ADDRESSES/SEND_LEDGER_TRANSACTION_SUCCESS", payload: {txid: sentTransaction}}
        return OwnAddressesActions.sendLedgerTransactionSuccess(sentTransaction)
      }

      // return { type: "APP/OWN_ADDRESSES/SEND_LEDGER_TRANSACTION_FAILURE" }
      return OwnAddressesActions.sendLedgerTransactionFailure()

    } catch (err) {
      console.log(err.toString())
      /*
        if(err.toString().includes("TransportError: Ledger Device is busy") || err.toString().includes("Error: cannot open device with path")){
        //return { type: "APP/OWN_ADDRESSES/EMPTY"}
        return OwnAddressesActions.empty()
        }
      */

      // return { type: "APP/OWN_ADDRESSES/SEND_LEDGER_TRANSACTION_FAILURE" }
      return OwnAddressesActions.sendLedgerTransactionFailure()
    }
  })
)

const sendLedgerTransactionInvalidParamsEpic = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(OwnAddressesActions.sendLedgerTransactionInvalidParams),
  tap(() => {
    toastr.error(t(`Please make sure destination address and amount are valid.`))
  }),
  mapTo(OwnAddressesActions.empty())
)

export const OwnAddressesEpics = (action$, state$) => merge(
  getOwnAddressesEpic(action$, state$),
  createAddressEpic(action$, state$),
	initiatePrivateKeysExportEpic(action$, state$),
	exportPrivateKeysEpic(action$, state$),
  initiatePrivateKeyImportEpic(action$, state$),
  initiatePrivateKeysImportEpic(action$, state$),
  importPrivateKeyEpic(action$, state$),
	importPrivateKeysEpic(action$, state$),
  mergeAllMinedCoinsEpic(action$, state$),
  mergeAllRAddressCoinsEpic(action$, state$),
  mergeAllZAddressCoinsEpic(action$, state$),
  mergeAllCoinsEpic(action$, state$),
  mergeCoinsOperationStartedEpic(action$, state$),
  mergeCoinsFailureEpic(action$, state$),
  isLedgerConnectedEpic(action$, state$),
  sendLedgerTransactionEpic(action$, state$),
  sendLedgerTransactionInvalidParamsEpic(action$, state$)
)
