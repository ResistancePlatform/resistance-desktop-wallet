// @flow
import path from 'path'
import * as fs from 'fs'
import { promisify } from 'util'
import { Decimal } from 'decimal.js'
import { v4 as uuid } from 'uuid'
import { remote } from 'electron'
import Client from 'bitcoin-core'
import { from, Observable, of } from 'rxjs'
import { map, tap, take, catchError, switchMap } from 'rxjs/operators'
import { toastr } from 'react-redux-toastr'

import { TRANSACTION_FEE } from '../constants'
import { LoggerService, ConsoleTheme } from './logger-service'
import { OSService } from './os-service'
import { ResistanceService } from './resistance-service'
import { AddressBookService } from './address-book-service'
import { SettingsActions } from '../state/reducers/settings/settings.reducer'
import { BlockchainInfo, DaemonInfo, SystemInfoActions } from '../state/reducers/system-info/system-info.reducer'
import { Balances, OverviewActions, Transaction } from '../state/reducers/overview/overview.reducer'
import { OwnAddressesActions, AddressRow } from '../state/reducers/own-addresses/own-addresses.reducer'
import { SendCashActions } from '../state/reducers/send-cash/send-cash.reducer'
import { AddressBookRow } from '../state/reducers/address-book/address-book.reducer'

/**
 * ES6 singleton
 */
let instance = null
let clientInstance = null

/**
 * Create a new resistance client instance.
 */
const getClientInstance = () => {
  if (!clientInstance) {
    const nodeConfig = remote.getGlobal('resistanceNodeConfig')
    let network

    if (nodeConfig.testnet) {
      network = 'testnet'
    } else if (nodeConfig.regtest) {
      network = 'regtest'
    }

    clientInstance = new Client({
      network,
      port: nodeConfig.rpcport,
      username: nodeConfig.rpcuser,
      password: nodeConfig.rpcpassword,
      timeout: 2000
    })
  }

	return clientInstance
}

/**
 * @export
 * @class RpcService
 */
export class RpcService {
	logger: LoggerService
  osService: OSService
  resistanceService: ResistanceService
	addressBookService: AddressBookService

	/**
	 *Creates an instance of RpcService.
	 * @memberof RpcService
	 */
	constructor() {
		if (!instance) {
			instance = this
		}

		this.logger = new LoggerService()
		this.osService = new OSService()
		this.resistanceService = new ResistanceService()
		this.addressBookService = new AddressBookService()

		return instance
	}

	/**
	 * Reques Resistance node running status and memory usage.
	 *
	 * @memberof RpcService
	 */
  requestDaemonInfo() {
    const client = getClientInstance()

    client.getInfo()
      .then((info: DaemonInfo) => {
        this.osService.dispatchAction(SystemInfoActions.gotDaemonInfo(info))
        return Promise.resolve()
      })
      .catch(err => {
        const errorMessage = `Unable to get Resistance local node info: ${err}`
        this.osService.dispatchAction(SystemInfoActions.getDaemonInfoFailure(errorMessage, err.code))
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
      tap(result =>
          this.logger.debug(this, `requestWalletInfo`, `result: `, ConsoleTheme.testing, result)
         ),
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
        this.osService.dispatchAction(OverviewActions.gotWalletInfo(result))
      },
      error => {
        this.logger.debug(this, `startPollingWalletInfo`, `subscribe error: `, ConsoleTheme.error, error)
        this.osService.dispatchAction(OverviewActions.getWalletInfoFailure(`Unable to get wallet info: ${error}`))
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
      this::getPublicTransactionsPromise(client),
      this::getPrivateTransactionsPromise(client)
    ]

    const combineQueryPromise = Promise.all(queryPromiseArr)
      .then(result => {
        const combinedTransactionList = [...result[0], ...result[1]]
        const sortedByDateTransactions = combinedTransactionList.sort((trans1, trans2) => (
          new Date(trans2.timestamp) - new Date(trans1.timestamp)
        ))
        return { transactions: sortedByDateTransactions }
      })

    this::applyAddressBookNamesToTransactions(combineQueryPromise)
      .subscribe(
        result => {
          this.logger.debug(this, `requestTransactionsDataFromWallet`, `subscribe result: `, ConsoleTheme.testing, result)
          this.osService.dispatchAction(OverviewActions.gotTransactionDataFromWallet(result.transactions))
        },
        error => {
          this.logger.debug(this, `requestTransactionsDataFromWallet`, `subscribe error: `, ConsoleTheme.error, error)
          this.osService.dispatchAction(OverviewActions.getTransactionDataFromWalletFailure(`Unable to get transactions from the wallet: ${error}`))
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

    const blockchainInfo: BlockchainInfo = {
      connectionCount: 0,
      blockchainSynchronizedPercentage: 0,
      lastBlockDate: null
    }

    client.getConnectionCount()
      .then(result => {
        blockchainInfo.connectionCount = result
        return client.getBlockCount()
      })
      .then(result => client.getBlockHash(result))
      .then(result => client.getBlock(result))
      .then(result => {
        this.logger.debug(this, `requestBlockchainInfo`, `gotBlockchainInfo`, ConsoleTheme.testing, result)
        blockchainInfo.lastBlockDate = new Date(result.time * 1000)
        blockchainInfo.blockchainSynchronizedPercentage = this.getBlockchainSynchronizedPercentage(blockchainInfo.lastBlockDate)
        this.osService.dispatchAction(SystemInfoActions.gotBlockchainInfo(blockchainInfo))
        return Promise.resolve()
      })
      .catch(err => {
        this.logger.debug(this, `requestBlockchainInfo`, `getBlockchainInfoFailure`, ConsoleTheme.error, err)
        this.osService.dispatchAction(SystemInfoActions.getBlockchainInfoFailure(`Unable to get blockchain info: ${err}`, err.code))
      })
  }

  /**
   * @param {*} tempDate
   * @memberof RpcService
   */
  getBlockchainSynchronizedPercentage(tempDate: Date) {
    // TODO: Get the start date right after ZCash release - from first block!!!
    const startDate = new Date('28 Oct 2016 02:00:00 GMT')
    const nowDate = new Date()

    const fullTime = nowDate.getTime() - startDate.getTime()
    const remainingTime = nowDate.getTime() - tempDate.getTime()

    // After 20 min we report 100% anyway
    if (remainingTime > 20 * 60 * 1000) {
      let dPercentage = 100 - remainingTime / fullTime * 100
      if (dPercentage < 0) {
        dPercentage = 0
      } else if (dPercentage > 100) {
        dPercentage = 100
      }

      // Also set a member that may be queried
      return parseFloat(dPercentage.toFixed(2))
    }

    return 100
  }

	/**
	 * @param {boolean} [isPrivate]
	 * @returns {Observable<any>}
	 * @memberof RpcService
	 */
	createNewAddress(isPrivate?: boolean): Observable<any> {
		const client = getClientInstance()
		const createNewAddressPromise = client.command([{ method: isPrivate ? `z_getnewaddress` : `getnewaddress` }])

		return from(createNewAddressPromise).pipe(
			map(result => result[0]),
			tap(newAddress => this.logger.debug(this, `createNewAddress`, `create ${isPrivate ? 'private ' : 'transparent '} address: `, ConsoleTheme.testing, newAddress)),
			catchError(error => {
				this.logger.debug(this, `createNewAddress`, `Error happened: `, ConsoleTheme.error, error)
				return of('')
			})
		)
	}

	/**
	 * @param {string} fromAddress
	 * @param {string} toAddress
	 * @param {Decimal} amountToSend
	 * @returns {Observable<any>}
	 * @memberof RpcService
	 */
	sendCash(fromAddress: string, toAddress: string, amountToSend: Decimal) {
		const client = getClientInstance()

    const commandParameters= [
      fromAddress,
      [{ address: toAddress, amount: amountToSend.sub(TRANSACTION_FEE) }]
    ]

    // Confirmations number, important!
    if (fromAddress.toLowerCase().startsWith('r') && toAddress.toLowerCase().startsWith('r')) {
      commandParameters.push(0)
    }

    const command = client.command([{ method: `z_sendmany`, parameters: commandParameters }])

    command.then(([result])=> {
      if (typeof(result) === 'string') {
        this.osService.dispatchAction(SendCashActions.sendCashOperationStarted(result))
      } else {
        this.osService.dispatchAction(SendCashActions.sendCashFailure(result.message))
      }
      return Promise.resolve()
    })
    .catch(err => (
      this.osService.dispatchAction(SendCashActions.sendCashFailure(err.toString()))
    ))
	}

	/**
	 * @param {boolean} sortByGroupBalance
	 * @param {boolean} disableThePrivateAddress
	 * @returns {Observable<any>}
	 * @memberof RpcService
	 */
	getWalletAddressAndBalance(sortByGroupBalance?: boolean, disableThePrivateAddress?: boolean): Observable<any> {
		const client = getClientInstance()

		const promiseArr = [
			this::getWalletAllPublicAddresses(client),
			this::getWalletPublicAddressesWithUnspentOutputs(client),
			this::getWalletPrivateAddresses(client)
		]

		const queryPromise = Promise.all(promiseArr)
			.then(result => {
				// console.log(`result: `, result)
				const PublicAddressesResult = result[0][0]
				const PublicAddressesUnspendResult = result[1][0]
				const privateAddressesResult = result[2][0]
				const publicAddressResultSet = new Set()
				const privateAddressResultSet = new Set()

				if (Array.isArray(PublicAddressesResult)) {
					const publicAddresses = PublicAddressesResult.map(tempValue => tempValue.address)
					for (let index = 0; index < publicAddresses.length; index++) {
						publicAddressResultSet.add(publicAddresses[index])
					}
				}

				if (Array.isArray(PublicAddressesUnspendResult)) {
					const publicAddresses = PublicAddressesUnspendResult.map(tempValue => tempValue.address)
					for (let index = 0; index < publicAddresses.length; index++) {
						publicAddressResultSet.add(publicAddresses[index])
					}
				}

				if (Array.isArray(privateAddressesResult)) {
					for (let index = 0; index < privateAddressesResult.length; index++) {
						privateAddressResultSet.add(privateAddressesResult[index])
					}
				}

				const combinedAddresses = [...Array.from(publicAddressResultSet), ...Array.from(privateAddressesResult)]
					.map(addr => ({
						balance: Decimal('0'),
						confirmed: false,
						address: addr,
						disabled: false
					}))

				this.logger.debug(this, `getWalletAddressAndBalance`, `combinedAddresses: `, ConsoleTheme.testing, combinedAddresses)
				return this::getAddressesBalance(client, combinedAddresses)
			})
			.then(addresses => {
				this.logger.debug(this, `getWalletAddressAndBalance`, `addresses: `, ConsoleTheme.testing, addresses)

				let addressList = null

				// Sort for each groups
				if (sortByGroupBalance) {
					const publicAddresses = []
					const privateAddresses= []

					for (let index = 0; index < addresses.length; index++) {
						const tempAddressItem = addresses[index];
						if (tempAddressItem.address.startsWith('z')) {
							privateAddresses.push(tempAddressItem)
						} else {
							publicAddresses.push(tempAddressItem)
						}
					}

					publicAddresses.sort((item1, item2) => item2.balance.sub(item1.balance))
					privateAddresses.sort((item1, item2) => item2.balance.sub(item1.balance))

					addressList = [...publicAddresses, ...privateAddresses]
				} else {
					addressList = addresses
				}

				// Show the error to user
				const errorAddressItems = addressList.filter(tempAddressItem => tempAddressItem.balance === null && tempAddressItem.errorMessage)

				if (errorAddressItems && errorAddressItems.length > 0) {
          const errorMessages = errorAddressItems.map(tempAddressItem => `"${tempAddressItem.errorMessage}"`)
					const uniqueErrorMessages = Array.from(new Set(errorMessages)).join(', ')
					const displayMessage = `Error fetching balances for ${errorAddressItems.length} out of ${addressList.length} addresses. Error messages included: ${uniqueErrorMessages}.`
          toastr.error(`Address balance error`, displayMessage)
				}

				if (disableThePrivateAddress) {
					const isPrivateAddress = (tempAddress: string) => tempAddress.startsWith('z')
					// return addressList.map(tempAddressItem => isPrivateAddress(tempAddressItem.address) ? { ...tempAddressItem, disabled: true } : tempAddressItem)
					const processedAddressList = addressList.map(tempAddressItem => isPrivateAddress(tempAddressItem.address) ? { ...tempAddressItem, disabled: true } : tempAddressItem)
					this.logger.debug(this, `getWalletAddressAndBalance`, `processedAddressList: `, ConsoleTheme.testing, processedAddressList)
					return processedAddressList
				}

				return addressList
			})
			.catch(error => {
				this.logger.debug(this, `getWalletAddressAndBalance`, `Error happened: `, ConsoleTheme.error, error)
				return []
			})

		return from(queryPromise).pipe(take(1))
	}


	/**
   * Request own addresses with balances.
   *
	 * @memberof RpcService
	 */
  requestOwnAddresses() {
    this.getWalletAddressAndBalance(false).subscribe(result => {
      this.osService.dispatchAction(OwnAddressesActions.gotOwnAddresses(result))
    }, err => {
      this.osService.dispatchAction(OwnAddressesActions.getOwnAddressesFailure(err.toString()))
    })
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
      this.osService.dispatchAction(SystemInfoActions.gotOperations(operations))
      return Promise.resolve()
    }).catch(err => (
      this.osService.dispatchAction(SystemInfoActions.getOperationsFailure(`Unable to get operations: ${err}`, err.code))
    ))
  }

	/**
   * Request merge all mined coins operation.
   *
	 * @memberof RpcService
	 */
  mergeAllMinedCoins(zAddress: string) {
    const command = getClientInstance().command('z_shieldcoinbase', '*', zAddress)
    this::performMergeCoinsCommand(command)
  }

	/**
   * Request merge all R-address coins operation.
   *
	 * @memberof RpcService
	 */
  mergeAllRAddressCoins(zAddress: string) {
    const command = getClientInstance().command('z_mergetoaddress', ['ANY_TADDR'], zAddress)
    this::performMergeCoinsCommand(command)
  }

	/**
   * Request merge all Z-address coins operation.
   *
	 * @memberof RpcService
	 */
  mergeAllZAddressCoins(zAddress: string) {
    const command = getClientInstance().command('z_mergetoaddress', ['ANY_ZADDR'], zAddress)
    this::performMergeCoinsCommand(command)
  }

	/**
   * Request merge all coins operation.
   *
	 * @memberof RpcService
	 */
  mergeAllCoins(zAddress: string) {
    const command = getClientInstance().command('z_mergetoaddress', ['*'], zAddress)
    this::performMergeCoinsCommand(command)
  }

	/**
	 * @param {string} transactionId
	 * @memberof RpcService
	 */
	getTransactionDetail(transactionId: string) {
		const client = getClientInstance()
		const queryPromise = client.command([{ method: 'gettransaction', parameters: [transactionId] }])

		return from(queryPromise).pipe(
			map(results => results[0]),
			tap(result => this.logger.debug(this, `getTransactionDetail`, `result: `, ConsoleTheme.testing, result)),
			map(result => {
				if (result.name === 'RpcError') {
					return result.message
				}

				const tempObj = {}
				Object.keys(result.details[0]).reduce((objToReturn, key) => {
					if (key === 'amount') {
						objToReturn[`details[0].${key}`] = Decimal(result.details[0][`${key}`])
					} else {
						objToReturn[`details[0].${key}`] = result.details[0][`${key}`]
					}

					return objToReturn
				}, tempObj)

				const detailResult = { ...result, amount: Decimal(result.amount), ...tempObj }
				delete detailResult.details
				delete detailResult.vjoinsplit
				delete detailResult.walletconflicts

				this.logger.debug(this, `getTransactionDetail`, `detailResult: `, ConsoleTheme.testing, detailResult)

				return detailResult
			}),
			catchError(error => {
				this.logger.debug(this, `getTransactionDetail`, `Error happened: `, ConsoleTheme.error, error)
				return of(error.message)
			})
		)
	}

	/**
   * Export wallet to a file.
   *
	 * @memberof RpcService
	 */
  exportWallet(filePath) {
    const client = getClientInstance()

    const exportFileName = uuid().replace(/-/g, '')
    const exportFilePath = path.join(this.resistanceService.getExportDir(), exportFileName)

    const commandPromise = client.command('z_exportwallet', exportFileName)

    commandPromise.then((result) => {
      if (typeof(result) === 'object' && result.name === 'RpcError') {
        throw new Error(result.message)
      }
      return this.osService.moveFile(exportFilePath, filePath)
    }).then(() => (
      this.osService.dispatchAction(SettingsActions.exportWalletSuccess())
    )).catch(err => (
      this.osService.dispatchAction(SettingsActions.exportWalletFailure(err.toString()))
    ))
  }

	/**
   * Import wallet from a file.
   *
	 * @memberof RpcService
	 */
  importWallet(filePath) {
    const client = getClientInstance()

    const importFileName = uuid().replace(/-/g, '')
    const importFilePath = path.join(process.cwd(), importFileName)

    const errorHandler = err => (
      this.osService.dispatchAction(SettingsActions.importWalletFailure(err.toString()))
    )

    fs.copyFile(filePath, importFilePath, err => {
      if (err) {
        return errorHandler(err)
      }

      client.command('z_importwallet', importFileName).then(() => (
        this.osService.dispatchAction(SettingsActions.importWalletSuccess())
      )).catch(errorHandler).then(() => (
        promisify(fs.unlink)(importFilePath)
      )).catch(console.error)

    })

  }
}

/* RPC Service private methods */

/**
 * @param {Client} client
 * @returns {Promise<any>}
 * @memberof RpcService
 */
function getWalletPrivateAddresses(client: Client): Promise<any> {
  return client.command([{ method: 'z_listaddresses' }])
}

/**
 * @param {Client} client
 * @returns {Promise<any>}
 * @memberof RpcService
 */
function getWalletAllPublicAddresses(client: Client): Promise<any> {
  return client.command([{ method: 'listreceivedbyaddress', parameters: [0, true] }])
}

/**
 * @param {Client} client
 * @returns {Promise<any>}
 * @memberof RpcService
 */
function getWalletPublicAddressesWithUnspentOutputs(client: Client): Promise<any> {
  return client.command([{ method: 'listunspent', parameters: [0] }])
}

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

  return client.command(command)
    .then(result => result[0])
    .then(result => {
      if (Array.isArray(result)) {
        return result.map(
          originalTransaction => ({
            type: `\u2605 T (Public)`,
            category: originalTransaction.category,
            confirmations: originalTransaction.confirmations,
            amount: Decimal(originalTransaction.amount),
            timestamp: originalTransaction.time,
            destinationAddress: originalTransaction.address ? originalTransaction.address : `[ Z Address not listed in Wallet ]`,
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
    for (let index = 0; index < privateAddresses.length; index++) {
      const tempAddress = privateAddresses[index];

      /* eslint-disable-next-line no-await-in-loop */
      const addressTransactions = await client.command(getWalletZReceivedTransactionsCmd(tempAddress)).then(tempResult => tempResult[0])

      if (Array.isArray(addressTransactions) && addressTransactions.length > 0) {
        const addressTransactionsWithPrivateAddress = addressTransactions.map(tran => Object.assign({}, tran, { address: tempAddress }))
        queryResultWithAddressArr = [...queryResultWithAddressArr, ...addressTransactionsWithPrivateAddress]
      }
    }

    const tempTransactionList = queryResultWithAddressArr.map(result => ({
      type: `\u2605 T (Private)`,
      category: 'receive',
      confirmations: 0,
      amount: Decimal(result.amount),
      timestamp: 0,
      destinationAddress: result.address,
      transactionId: result.txid
    }))

    // At this moment, we got all transactions for each private address, but each one of them is missing the `confirmations` and `time`,
    // we need to get that info by viewing the detail of the transaction, and then put it back !
    for (let index = 0; index < tempTransactionList.length; index++) {
      const tempTransaction = tempTransactionList[index];
      /* eslint-disable-next-line no-await-in-loop */
      const transactionDetail = await client.command(getWalletTransactionCmd(tempTransaction.transactionId)).then(tempResult => tempResult[0])
      tempTransaction.confirmations = transactionDetail.confirmations
      tempTransaction.timestamp = transactionDetail.time
    }

    return tempTransactionList
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

        return this.addressBookService.loadAddressBook().pipe(
          map((addressBookRows: AddressBookRow[] | []) => {
            if (!addressBookRows || !addressBookRows.length) {
              return result
            }

            result.transactions = result.transactions.map((tempTransaction: Transaction) => {
              const matchedAddressBookRow = addressBookRows.find(tempAddressRow => tempAddressRow.address === tempTransaction.destinationAddress)
              return matchedAddressBookRow ? ({ ...tempTransaction, destinationAddress: matchedAddressBookRow.name }) : tempTransaction
            })

            return result
          })
        )
      }),
      take(1)
    )

    return observable
}

/**
 * Private method. Gets addresses balances in a batch request.
 *
 * @param {Client} client
 * @param {AddressRow[]} addressRows
 * @returns {Promise<any>}
 * @memberof RpcService
 */
function getAddressesBalance(client: Client, addressRows: AddressRow[]): Promise<any> {
  const commands: Object[] = []

  addressRows.forEach(address => {
    const confirmedCmd = { method: 'z_getbalance', parameters: [address.address] }
    const unconfirmedCmd = { method: 'z_getbalance', parameters: [address.address, 0] }
    commands.push(confirmedCmd, unconfirmedCmd)
  })

  const promise = client.command(commands)
    .then(balances => {

      const addresses = addressRows.map((address, index) => {

        const confirmedBalance = balances[index * 2]
        const unconfirmedBalance = balances[index * 2 + 1]

        if (typeof(confirmedBalance) === 'object' || typeof(unconfirmedBalance) === 'object') {
          return {
            ...address,
            balance: null,
            confirmed: false,
            errorMessage: confirmedBalance.message || unconfirmedBalance.message
          }
        }

        const isConfirmed = confirmedBalance === unconfirmedBalance
        const displayBalance = isConfirmed ? confirmedBalance : unconfirmedBalance

        return {
          ...address,
          balance: Decimal(displayBalance),
          confirmed: isConfirmed
        }
      })

      return addresses
    })
    .catch(err => {
      this.logger.debug(this, `getAddressesBalance`, `Error occurred: `, ConsoleTheme.error, err)

      const addresses = addressRows.map(address => ({
        ...address,
        balance: null,
        confirmed: false,
        errorMessage: err.toString()
      }))

      return addresses
    })

  return promise
}

/**
 * Private method. Handles merge coins commands by dispatching success and failure messages.
 *
 * @param {Promise<any>} commandPromise Result of client.command
 * @memberof RpcService
 */
function performMergeCoinsCommand(commandPromise: Promise<any>) {
    commandPromise.then((result) => (
      this.osService.dispatchAction(OwnAddressesActions.mergeCoinsOperationStarted(result.opid))
    )).catch(err => (
      this.osService.dispatchAction(OwnAddressesActions.mergeCoinsFailure(err.toString()))
    ))
}
