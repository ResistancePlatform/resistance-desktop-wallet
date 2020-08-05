// @flow
import path from 'path'
import * as fs from 'fs'
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async/dynamic'
import { promisify } from 'util'
import log from 'electron-log'
import { Decimal } from 'decimal.js'
import { v4 as uuid } from 'uuid'
import { remote } from 'electron'
import Client from 'bitcoin-core'
import { from, of } from 'rxjs'
import { map, take, catchError, switchMap } from 'rxjs/operators'

import { translate } from '~/i18next.config'
import { RPC } from '~/constants/rpc'
import { getExportDir, moveFile } from '~/utils/os'
import { DECIMAL } from '~/constants/decimal'
import { getStore } from '~/store/configureStore'
import { AddressBookService } from './address-book-service'
import { BlockchainInfo, DaemonInfo, SystemInfoActions } from '../reducers/system-info/system-info.reducer'
import { Balances, OverviewActions, Transaction } from '../reducers/overview/overview.reducer'
import { OwnAddressesActions } from '../reducers/own-addresses/own-addresses.reducer'
import { SendCurrencyActions } from '~/reducers/send-currency/send-currency.reducer'
import { AddressBookRecord } from '~/reducers/address-book/address-book.reducer'


const t = translate('service')

const addressBookService = new AddressBookService()

/**
 * ES6 singleton
 */
let instance = null
const clientInstance = {}

const recoverableErrors = ['ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', RPC.IN_WARMUP, 500]

export function retry(func, id) {
  const promise = new Promise((resolve, reject) => {
    let result
    let interval

    const clear = () => {
      log.debug(`Clearing interval`, interval)
      clearIntervalAsync(interval)
      interval = null
    }

    const now = () => (new Date()).getTime()
    const startedTimestamp = now()

    log.debug(`Retry: Starting`, func.name)

    interval = setIntervalAsync(async () => {
      log.debug(`Retry: trying`, func.name, interval)

      try {
        result = await func()
        clear()
        log.debug(`Retry: success`, func.name)
        return resolve(result)
      } catch (err) {

        if (id === 'encryptWallet' && err.code === RPC.WALLET_WRONG_ENC_STATE) {
          log.debug(`Resolving encryptWallet due to an error`)
          clear()
          return resolve(result)
        }

        if (!recoverableErrors.includes(err.code)) {
          clear()
          log.debug(`Retry: bad error`, func.name, err.code)
          return reject(err)
        }

        if ((now() - startedTimestamp) > 60 * 1000) {
          clear()
          log.debug(`Retry: Timed out`, func.name)
          return reject(err)
        }

        log.debug(`Retry: Recoverable error`, func.name)
      }
    }, 1000)
  })

  return promise
}

/**
 * Create a new resistance client instance.
 */
export const getClientInstance = (isEtomic: boolean = false) => {
  if (!clientInstance[isEtomic]) {
    const nodeConfig = remote.getGlobal('resistanceNodeConfig')
    let network

    if (nodeConfig.testnet) {
      network = 'testnet'
    } else if (nodeConfig.regtest) {
      network = 'regtest'
    }

    clientInstance[isEtomic] = new Client({
      network,
      port: isEtomic ? 15672 : nodeConfig.rpcport,
      username: nodeConfig.rpcuser,
      password: nodeConfig.rpcpassword,
      timeout: 100000
    })
  }

  return clientInstance[isEtomic]
}

/**
 * @export
 * @class RpcService
 */
export class RpcService {
  /**
   * Creates an instance of RpcService.
   *
   * @memberof RpcService
   */
  constructor() {
    if (!instance) {
      instance = this
    }

    return instance
  }

  /**
   * Encrypts the wallet with a passphrase.
   *
   * @memberof RpcService
   */
  encryptWallet(password: string) {
    const client = getClientInstance()
    return client.command('encryptwallet', password)
  }

  /**
   * Encrypts the wallet with a passphrase.
   *
   * @memberof RpcService
   */
  sendWalletPassword(password: string, timeoutSec: number) {
    const client = getClientInstance()
    return client.command('walletpassphrase', password, timeoutSec)
  }

  /**
   * Encrypts the wallet with a passphrase.
   *
   * @memberof RpcService
   */
  changeWalletPassword(oldPassword: string, newPassword: string) {
    const client = getClientInstance()
    return client.command('walletpassphrasechange', oldPassword, newPassword)
  }

  /**
   * Requests Resistance node running status and memory usage.
   *
   * @memberof RpcService
   */
  requestDaemonInfo() {
    const client = getClientInstance()

    client.getInfo()
      .then((info: DaemonInfo) => {
        getStore().dispatch(SystemInfoActions.gotDaemonInfo(info))
        return Promise.resolve()
      })
      .catch(err => {
        // TODO: move the prefix to toastr error title in the epic #114
        const errorPrefix = t(`Unable to get Resistance local node info`)
        getStore().dispatch(SystemInfoActions.getDaemonInfoFailure(`${errorPrefix}: ${err}`, err.code))
      })
  }

  getInfo() {
    const client = getClientInstance()

    client.getInfo()
      .then((info: DaemonInfo) => {
        getStore().dispatch(SystemInfoActions.gotDaemonInfo(info))
        return Promise.resolve()
      })
      .catch(err => {
        // TODO: move the prefix to toastr error title in the epic #114
        const errorPrefix = t(`Unable to get Resistance local node info`)
        getStore().dispatch(SystemInfoActions.getDaemonInfoFailure(`${errorPrefix}: ${err}`, err.code))
      })
  }

  /**
   * Request the wallet information.
   *
   * @memberof RpcService
   */
  requestWalletInfo() {
    const client = getClientInstance()

    const commandList = [
      { method: 'z_gettotalbalance' },
      { method: 'z_gettotalbalance', parameters: [0] }
    ]

    from(client.command(commandList))
      .pipe(
        map(result => ({
          transparentBalance: Decimal(result[0].transparent),
          privateBalance: Decimal(result[0].private),
          totalBalance: Decimal(result[0].total),
          transparentUnconfirmedBalance: Decimal(result[1].transparent),
          privateUnconfirmedBalance: Decimal(result[1].private),
          totalUnconfirmedBalance: Decimal(result[1].total)
        }))
      )
      .subscribe(
        (result: Balances) => {
          getStore().dispatch(OverviewActions.gotWalletInfo(result))
        },
        error => {
          log.debug(`Error fetching the wallet balances: ${error}`)
          // TODO: move the prefix to toastr error title in the epic #114
          const errorPrefix = t(`Unable to get Resistance local node info`)
          getStore().dispatch(OverviewActions.getWalletInfoFailure(`${errorPrefix}: ${error}`))
        }
      )
  }

  /**
   * Request wallet transactions.
   *
   * @memberof RpcService
   */
  requestTransactionsDataFromWallet() {
    const client = getClientInstance()

    const queryPromiseArr = [
      this:: getPublicTransactionsPromise(client),
      this:: getPrivateTransactionsPromise(client)
    ]

    const combineQueryPromise = Promise.all(queryPromiseArr)
      .then(result => {
        const combinedTransactionsList = [...result[0], ...result[1]]
        const sortedByDateTransactions = combinedTransactionsList.sort((trans1, trans2) => (
          new Date(trans2.timestamp) - new Date(trans1.timestamp)
        ))
        return { transactions: sortedByDateTransactions }
      })

    this:: applyAddressBookNamesToTransactions(combineQueryPromise)
      .subscribe(
        result => {
          log.debug(`Wallet transactions: ${result}`)
          getStore().dispatch(OverviewActions.gotTransactionDataFromWallet(result.transactions))
        },
        error => {
          log.debug(`Error fetching wallet transactions: ${error}`)
          // TODO: move the prefix to toastr error title in the epic #114
          const errorPrefix = t(`Unable to get transactions from the wallet`)
          getStore().dispatch(OverviewActions.getTransactionDataFromWalletFailure(`${errorPrefix}: ${error}`))
        }
      )
  }

  /**
   * Request blockchain information.
   *
   * @memberof RpcService
   */
  requestBlockchainInfo() {
    const client = getClientInstance()

    //wkt
    const timenow = () => new Date().getTime();
    var lastBlocktime;
    //wkt end


    const blockchainInfo: BlockchainInfo = {
      lastBlockDate: null,
      connectionCount: 0,
      synchronizedPercentage: 0
    }

    client.getConnectionCount()
      .then(result => {
        blockchainInfo.connectionCount = result
        return client.getBlockCount()
      })
      .then(result => client.getBlockHash(result))
      .then(result => client.getBlock(result))
      .then(result => {
        blockchainInfo.lastBlockDate = new Date(result.time * 1000)
        lastBlocktime = Date.parse(blockchainInfo.lastBlockDate) / 1000;
        return client.getBlockchainInfo()
      })
      .then(result => {
        blockchainInfo.synchronizedPercentage = 0

        var block_diff = (timenow() / 1000 - lastBlocktime) / 60;
        // Design constrain, no option to check if system time is in future
        if (block_diff < -150) {
          throw "Incorrect System Time";
        }
        if (block_diff < 0) {
          block_diff = 0;
        }

        var estimatedTotalHeight = result.blocks + block_diff;
        if (estimatedTotalHeight < result.headers) {
          estimatedTotalHeight = result.headers;
        }
        if (estimatedTotalHeight < 500000) {
          estimatedTotalHeight = 500000;
        }
        var syncpercent_onEstHeight =
          (100.0 * [(result.blocks + result.headers) / 2]) /
          (estimatedTotalHeight + 1);

        //Resdex login works only on 100%
        if (
          estimatedTotalHeight - result.blocks < 60 &&
          result.blocks == result.headers &&
          result.blocks > 500000
        ) {
          syncpercent_onEstHeight = 100;
        }

        blockchainInfo.synchronizedPercentage = syncpercent_onEstHeight;

        getStore().dispatch(SystemInfoActions.gotBlockchainInfo(blockchainInfo))
        return Promise.resolve()
      })
      .catch(err => {
        log.debug(`Error fetching the blockchain: ${err}`)
        // TODO: move the prefix to toastr error title in the epic #114
        const errorPrefix = t(`Unable to get blockchain info`)
        getStore().dispatch(SystemInfoActions.getBlockchainInfoFailure(`${errorPrefix}: ${err}`, err.code))
      })
  }

  /**
   * @param {boolean} [isPrivate]
   * @returns {Observable<any>}
   * @memberof RpcService
   */
  createNewAddress(isPrivate?: boolean): Promise<any> {
    const client = getClientInstance()
    return client.command(isPrivate ? 'z_getnewaddress' : 'getnewaddress')
  }

  /**
   * @param {string} fromAddress
   * @param {string} toAddress
   * @param {Decimal} amountToSend
   * @returns {Observable<any>}
   * @memberof RpcService
   */
  sendCurrency(fromAddress: string, toAddress: string, amountToSend: Decimal) {
    const client = getClientInstance()

    const commandParameters = [
      fromAddress,
      [{ address: toAddress, amount: amountToSend.sub(DECIMAL.transactionFee) }]
    ]

    // Confirmations number, important!
    if (fromAddress.toLowerCase().startsWith('r') && toAddress.toLowerCase().startsWith('r')) {
      commandParameters.push(0)
    }

    const command = client.command([{ method: `z_sendmany`, parameters: commandParameters }])

    command.then(([result]) => {
      if (typeof (result) === 'string') {
        getStore().dispatch(SendCurrencyActions.sendCurrencyOperationStarted(result))
      } else {
        getStore().dispatch(SendCurrencyActions.sendCurrencyFailure(result.message))
      }
      return Promise.resolve()
    })
      .catch(err => (
        getStore().dispatch(SendCurrencyActions.sendCurrencyFailure(err.toString()))
      ))
  }

  /**
   * @param {Client} client
   * @returns {Promise<any>}
   * @memberof RpcService
   */
  getWalletAllPublicAddresses(): Promise<any> {
    const client = getClientInstance()
    return client.command([{ method: 'listreceivedbyaddress', parameters: [0, true] }])
  }

  /**
   * @returns {Promise<any>}
   * @memberof RpcService
   */
  async getMyAddresses(sortByBalance?: boolean, disablePrivateAddresses?: boolean) {
    const client = getClientInstance()

    const commands = [
      {
        method: 'listreceivedbyaddress',
        parameters: [0, true]
      },
      {
        method: 'listunspent',
        parameters: [0]
      },
      {
        method: 'z_listaddresses'
      },
      {
        method: 'listaddressgroupings'
      },
    ]

    const [r, unspent, z, groupings] = await client.command(commands)

    const addresses = Array.from(new Set(Array.prototype.concat(
      r.map(a => a.address),
      unspent.map(a => a.address),
      z,
      groupings.reduce((accumulated, value) => (
        accumulated.concat(
          value.map(l => l[0])
        )
      ), [])
    )))

    const ledgerAddress = this:: getLedgerAddress()
    if (ledgerAddress !== null) {
      addresses.unshift(ledgerAddress)
    }

    const result = await this:: fetchAddressBalances(addresses, ledgerAddress)

    if (sortByBalance) {
      const zIndex = addresses.findIndex(a => a.startsWith('z'))

      const rAddresses = zIndex === -1 ? result : result.slice(0, zIndex)
      const zAddresses = zIndex === -1 ? [] : result.slice(zIndex)

      if (disablePrivateAddresses) {
        zAddresses.forEach((address, index) => {
          zAddresses[index].disabled = true
        })
      }

      return [...rAddresses, ...zAddresses]
    }

    return result
  }

  /**
   * Request known local node operations.
   *
   * @memberof RpcService
   */
  requestOperations() {
    const client = getClientInstance()

    client.command('z_listoperationids').then(operationIds => (
      client.command('z_getoperationstatus', operationIds)
    )).then(operations => {
      getStore().dispatch(SystemInfoActions.gotOperations(operations))
      return Promise.resolve()
    }).catch(err => {
      // TODO: move the prefix to toastr error title in the epic #114
      const errorPrefix = t(`Unable to get operations`)
      return getStore().dispatch(SystemInfoActions.getOperationsFailure(`${errorPrefix}: ${err}`, err.code))
    })
  }

  /**
   * Request merge all mined coins operation.
   *
   * @memberof RpcService
   */
  mergeAllMinedCoins(zAddress: string) {
    const command = getClientInstance().command('z_shieldcoinbase', '*', zAddress)
    this:: performMergeCoinsCommand(command)
  }

  /**
   * Request merge all R-address coins operation.
   *
   * @memberof RpcService
   */
  mergeAllRAddressCoins(zAddress: string) {
    const command = getClientInstance().command('z_mergetoaddress', ['ANY_TADDR'], zAddress)
    this:: performMergeCoinsCommand(command)
  }

  /**
   * Request merge all Z-address coins operation.
   *
   * @memberof RpcService
   */
  mergeAllZAddressCoins(zAddress: string) {
    const command = getClientInstance().command('z_mergetoaddress', ['ANY_ZADDR'], zAddress)
    this:: performMergeCoinsCommand(command)
  }

  /**
   * Request merge all coins operation.
   *
   * @memberof RpcService
   */
  mergeAllCoins(zAddress: string) {
    const command = getClientInstance().command('z_mergetoaddress', ['*'], zAddress)
    this:: performMergeCoinsCommand(command)
  }

  /**
   * @param {string} transactionId
   * @memberof RpcService
   */
  getTransactionDetails(transactionId: string) {
    const client = getClientInstance()
    const queryPromise = client.command([{ method: 'gettransaction', parameters: [transactionId] }])

    return from(queryPromise).pipe(
      map(results => results[0]),
      map(result => {
        if (result.name === 'RpcError') {
          return result.message
        }

        const tempObj = {}
        Object.keys(result.details[0]).reduce((accumulator, key) => {
          const modified = { ...accumulator }

          if (key === 'amount') {
            modified[`details[0].${key}`] = Decimal(result.details[0][`${key}`])
          } else {
            modified[`details[0].${key}`] = result.details[0][`${key}`]
          }

          return modified
        }, tempObj)

        const detailResult = { ...result, amount: Decimal(result.amount), ...tempObj }
        delete detailResult.details
        delete detailResult.vjoinsplit
        delete detailResult.walletconflicts

        log.debug(`Transaction details: ${detailResult}`)

        return detailResult
      }),
      catchError(error => {
        log.debug(`An error occurred while fetching transcation details: ${error}`)
        return of(error.message)
      })
    )
  }

  /**
   * Export private keys to a file.
   *
   * @memberof RpcService
   */
  exportPrivateKeys(filePath) {
    return this:: exportFileWithMethod('z_exportwallet', filePath)
  }

  /**
   * Import a single private key.
   *
   * @memberof RpcService
   * @returns {Observable}
   */
  importPrivateKey(privateKey: string) {
    const client = getClientInstance()
    return client.command('importprivkey', privateKey)
  }

  /**
   * Import private keys from a file.
   *
   * @memberof RpcService
   * @returns {Observable}
   */
  importPrivateKeys(filePath) {
    const client = getClientInstance()

    const importFileName = uuid().replace(/-/g, '')
    const importFilePath = path.join(getExportDir(), importFileName)

    const observable = from(
      promisify(fs.copyFile)(filePath, importFilePath)
        .then(() => (
          client.command('z_importwallet', importFilePath)
            .finally(() => promisify(fs.unlink)(importFilePath))
        ))
    )

    return observable
  }

  /**
   * Backup wallet to a file.
   *
   * @memberof RpcService
   * @returns {Observable}
   */
  backupWallet(filePath) {
    return this:: exportFileWithMethod('backupwallet', filePath)
  }


	/**
	 * Stops the Resistance daemon
   *
	 * @memberof RpcService
	 */
  stop() {
    const client = getClientInstance()
    return client.command('stop')
  }

}

/* RPC Service private methods */

/**
 * Private method. Returns public transactions array.
 *
 * @param {Client} client
 * @returns {Promise<any>}
 * @memberof RpcService
 */
async function getPublicTransactionsPromise(client: Client) {
  const command = [
    { method: 'listtransactions', parameters: ['', 200] }
  ]

  const noAddressMessage = t(`Z address is not listed in the wallet`)
  const publicAddressMessage = t(`R (Public)`)

  return client.command(command)
    .then(result => result[0])
    .then(result => {
      if (Array.isArray(result)) {
        return result.map(
          originalTransaction => ({
            type: `${publicAddressMessage}`,
            category: originalTransaction.category,
            confirmations: originalTransaction.confirmations,
            amount: Decimal(originalTransaction.amount),
            timestamp: originalTransaction.time,
            destinationAddress: originalTransaction.address ? originalTransaction.address : `[ ${noAddressMessage} ]`,
            transactionId: originalTransaction.txid
          })
        )
      }

      if (result.message) {
        throw new Error(result.message)
      }

      return []
    })

}

/**
 * Private method. Returns private transactions array.
 *
 * @param {Client} client
 * @returns {Promise<any>}
 * @memberof RpcService
 */
async function getPrivateTransactionsPromise(client: Client) {
  const getWalletZAddressesCmd = () => [{ method: 'z_listaddresses' }]
  const getWalletZReceivedTransactionsCmd = (zAddress) => [{ method: 'z_listreceivedbyaddress', parameters: [zAddress, 0] }]
  const getWalletTransactionCmd = (transactionId) => [{ method: 'gettransaction', parameters: [transactionId] }]

  // First, we get all the private addresses, and then for each one, we get all their transactions
  const privateAddresses = await client.command(getWalletZAddressesCmd()).then(tempResult => tempResult[0])

  if (Array.isArray(privateAddresses) && privateAddresses.length > 0) {
    let queryResultWithAddressArr = []
    for (let index = 0; index < privateAddresses.length; index += 1) {
      const tempAddress = privateAddresses[index];

      /* eslint-disable-next-line no-await-in-loop */
      const addressTransactions = await client.command(getWalletZReceivedTransactionsCmd(tempAddress)).then(tempResult => tempResult[0])

      if (Array.isArray(addressTransactions) && addressTransactions.length > 0) {
        const addressTransactionsWithPrivateAddress = addressTransactions.map(tran => Object.assign({}, tran, { address: tempAddress }))
        queryResultWithAddressArr = [...queryResultWithAddressArr, ...addressTransactionsWithPrivateAddress]
      }
    }

    const tempTransactionsList = queryResultWithAddressArr.map(result => ({
      type: t(`T (Private)`),
      category: 'receive',
      confirmations: 0,
      amount: Decimal(result.amount),
      timestamp: 0,
      destinationAddress: result.address,
      transactionId: result.txid
    }))

    // At this moment, we got all transactions for each private address, but each one of them is missing the `confirmations` and `time`,
    // we need to get that info by viewing the detail of the transaction, and then put it back !
    for (let index = 0; index < tempTransactionsList.length; index += 1) {
      const tempTransaction = tempTransactionsList[index];
      /* eslint-disable-next-line no-await-in-loop */
      const transactionDetails = await client.command(getWalletTransactionCmd(tempTransaction.transactionId)).then(tempResult => tempResult[0])
      tempTransaction.confirmations = transactionDetails.confirmations
      tempTransaction.timestamp = transactionDetails.time
    }

    return tempTransactionsList
  }

  return []
}

/**
 * Private method. Adds address book names to transactions.
 *
 * @param {Promise[any]} transactionsPromise Promise returning { transactions: [] } object.
 * @returns {Observable}
 * @memberof RpcService
 */
function applyAddressBookNamesToTransactions(transactionsPromise) {
  const observable = from(transactionsPromise)
    .pipe(
      switchMap(result => {
        if (!result.transactions || !result.transactions.length) {
          return [result]
        }

        return addressBookService.loadAddressBook().pipe(
          map((addressBookRecords: AddressBookRecord[]) => {
            if (!addressBookRecords.length) {
              return result
            }

            const modified = { ...result }

            modified.transactions = result.transactions.map((transaction: Transaction) => {
              const matchedRecord = (
                addressBookRecords
                  .find(record => record.address === transaction.destinationAddress)
              )
              return matchedRecord ? ({ ...transaction, destinationAddress: matchedRecord.name }) : transaction
            })

            return modified
          })
        )
      }),
      take(1)
    )

  return observable
}

/**
 * Private method. Appends ledger address to address list
 *
 * @returns {string}
 * @memberof RpcService
 */
function getLedgerAddress(): string | null {
  const state = getStore().getState()

  const {
    ledgerAddress,
    isLedgerResistanceAppOpen
  } = state.ownAddresses.connectLedgerModal

  if (isLedgerResistanceAppOpen) {
    return ledgerAddress
  }

  return null
}

async function fetchAddressBalances(addresses, ledgerAddress) {
  const client = getClientInstance()

  addresses.sort()

  const commands = addresses.reduce((accumulated, address) => (
    accumulated.concat([
      {
        method: 'z_getbalance',
        parameters: [address],
      },
      {
        method: 'z_getbalance',
        parameters: [address, 0],
      },
    ])
  ), [])

  const balances = await client.command(commands)

  const result = addresses.map((address, index) => {
    const confirmedBalance = balances[index * 2]
    const unconfirmedBalance = balances[index * 2 + 1]

    if ((confirmedBalance instanceof Error) || (unconfirmedBalance instanceof Error)) {
      return {
        balance: null,
        confirmed: false,
        errorMessage: confirmedBalance.message || unconfirmedBalance.message
      }
    }

    return {
      address,
      balance: Decimal(unconfirmedBalance),
      confirmed: confirmedBalance === unconfirmedBalance,
      isLedger: address === ledgerAddress
    }
  })

  return result
}

/**
 * Private method. Handles merge coins commands by dispatching success and failure messages.
 *
 * @param {Promise<any>} commandPromise Result of client.command
 * @memberof RpcService
 */
function performMergeCoinsCommand(commandPromise: Promise<any>) {
  commandPromise.then((result) => (
    getStore().dispatch(OwnAddressesActions.mergeCoinsOperationStarted(result.opid))
  )).catch(err => (
    getStore().dispatch(OwnAddressesActions.mergeCoinsFailure(err.toString()))
  ))
}


/**
 * Private method. Used to export private keys or backup the wallet to a file.
 *
 * @memberof RpcService
 */
function exportFileWithMethod(method, filePath) {
  const client = getClientInstance()

  const exportFileName = uuid().replace(/-/g, '')
  const exportFilePath = path.join(getExportDir(), exportFileName)

  return from(
    client.command(method, exportFileName)
      .then((result) => {
        if (typeof (result) === 'object' && result.name === 'RpcError') {
          throw new Error(result.message)
        }
        return moveFile(exportFilePath, filePath)
      })
  )
}
