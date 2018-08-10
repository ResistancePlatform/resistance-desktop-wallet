// @flow

import { remote } from 'electron'
import Client from 'bitcoin-core'
import { from, Observable, of } from 'rxjs'
import { map, tap, take, catchError } from 'rxjs/operators'
import { LoggerService, ConsoleTheme } from './logger-service'
import { DialogService } from './dialog-service'
import { getFormattedDateString } from '../utils/data-util'
import { AppAction } from '../state/reducers/appAction'
import { BlockChainInfo, DaemonInfo, SystemInfoActions } from '../state/reducers/system-info/system-info.reducer'
import { Balances, OverviewActions } from '../state/reducers/overview/overview.reducer'
import { AddressRow } from '../state/reducers/own-addresses/own-addresses.reducer'
import { SendCashActions, ProcessingOperation } from '../state/reducers/send-cash/send-cash.reducer'

/**
 * ES6 singleton
 */
let instance = null

/**
 * Get back the new resistance client instance
 */
const getResistanceClientInstance = () => {
	const nodeConfig = remote.getGlobal('resistanceNodeConfig')
	let network

	if (nodeConfig.testnet) {
		network = 'testnet'
	} else if (nodeConfig.regtest) {
		network = 'regtest'
	}

	const client = new Client({
		network,
		port: nodeConfig.rpcport,
		username: nodeConfig.rpcuser,
		password: nodeConfig.rpcpassword,
		timeout: 500
	})

	return client
}

let daemonInfoPollingIntervalId = -1
const daemonInfoPollingIntervalSetting = 2 * 1000
let blockchainInfoPollingIntervalId = -1
const blockchainInfoPollingIntervalSetting = 4 * 1000
let walletInfoPollingIntervalId = -1
const walletInfoPollingIntervalSetting = 2 * 1000
let transactionDataFromWalletPollingIntervalId = -1
const transactionDataFromWalletPollingIntervalSetting = 5 * 1000

let sendCashPollingIntervalId = -1
const sendCashPollingIntervalSetting = 2 * 1000

/**
 * @export
 * @class ResistanceCliService
 */
export class ResistanceCliService {
	logger: LoggerService
	dialogService: DialogService

	/**
	 *Creates an instance of ResistanceCliService.
	 * @memberof ResistanceCliService
	 */
	constructor() {
		if (!instance) {
			instance = this
		}

		this.time = new Date()
		this.logger = new LoggerService()
		this.dialogService = new DialogService()

		return instance
	}

	/**
	 * We CANNOT use:
	 *   import { appStore } from '../state/store/configureStore'
	 *
	 * As that will import BEFORE the `appStore` be created !!!
	 * We have to require the latest `appStore` to make sure it has been created !!!
	 *
	 * @param {AppAction} action
	 * @memberof ResistanceCliService
	 */
	dispatchAction(action: AppAction) {
		const storeModule = require('../state/store/configureStore')
		if (storeModule && storeModule.appStore) {
			storeModule.appStore.dispatch(action)
		}
	}

	/**
	 * Polling the daemon status per 2 second (after the first run), for getting the `resistanced` running status and memory usage
	 *
	 * @memberof ResistanceCliService
	 */
	startPollingDaemonStatus() {
		/**
		 *
		 */
		const getAsyncDaemonInfo = () => {
			const cli = getResistanceClientInstance()
			const daemonInfo: DaemonInfo = {
				status: 'RUNNING',
				residentSizeMB: 0,
				optionalError: null,
				getInfoResult: {}
			}

			const getInfoPromise = cli.getInfo()
				.then((result) => {
					daemonInfo.getInfoResult = result
					delete daemonInfo.optionalError
					return daemonInfo
				})
				.catch(error => {
					console.error(error)
					daemonInfo.optionalError = error
					return daemonInfo
				})

			from(getInfoPromise)
				.pipe(take(1))
				.subscribe(
					(result: DaemonInfo) => {
						const daemonInfoResult = Object.assign(result)

						if (daemonInfoResult.optionalError) {
							if (
								daemonInfoResult.optionalError.code &&
								daemonInfoResult.optionalError.code === 'ECONNREFUSED'
							) {
								daemonInfoResult.status = 'NOT_RUNNING'
							} else {
								daemonInfoResult.status = 'UNABLE_TO_ASCERTAIN'
							}
						}

						this.dispatchAction(
							SystemInfoActions.gotDaemonInfo(daemonInfoResult)
						)
					},
					error =>
						this.logger.debug(
							this,
							`startPollingDaemonStatus`,
							`Error happen: `,
							ConsoleTheme.error,
							error
						)
					// () => this.logger.debug(this, `startPollingDaemonStatus`, `observable completed.`, ConsoleTheme.testing)
				)
		}

		// The first run
		getAsyncDaemonInfo()

		// The periodic run
		if (daemonInfoPollingIntervalId !== -1) {
			clearInterval(daemonInfoPollingIntervalId)
			daemonInfoPollingIntervalId = -1
		}
		daemonInfoPollingIntervalId = setInterval(
			() => getAsyncDaemonInfo(),
			daemonInfoPollingIntervalSetting
		)
	}

	/**
	 * @memberof ResistanceCliService
	 */
	stopPollingWalletInfo() {
		if (walletInfoPollingIntervalId !== -1) {
			clearInterval(walletInfoPollingIntervalId)
			walletInfoPollingIntervalId = -1
		}
	}

	/**
	 * Polling the wallet info per 2 second (after the first run)
	 *
	 * @memberof ResistanceCliService
	 */
	startPollingWalletInfo() {
		/**
		 *
		 */
		const getAsyncWalletInfo = () => {
			const cli = getResistanceClientInstance()
			const commandList = [
				{ method: 'z_gettotalbalance' },
				{ method: 'z_gettotalbalance', parameters: [0] }
			]

			from(cli.command(commandList))
				.pipe(
					tap(result =>
						this.logger.debug(
							this,
							`startPollingWalletInfo`,
							`result: `,
							ConsoleTheme.testing,
							result
						)
					),
					map(result => ({
						transparentBalance: parseFloat(result[0].transparent),
						privateBalance: parseFloat(result[0].private),
						totalBalance: parseFloat(result[0].total),
						transparentUnconfirmedBalance: parseFloat(result[1].transparent),
						privateUnconfirmedBalance: parseFloat(result[1].private),
						totalUnconfirmedBalance: parseFloat(result[1].total)
					}))
				)
				.subscribe(
					(result: Balances) => {
						this.dispatchAction(OverviewActions.gotWalletInfo(result))
					},
					error =>
						this.logger.debug(
							this,
							`startPollingWalletInfo`,
							`subscribe error: `,
							ConsoleTheme.error,
							error
						)
					// () => this.logger.debug(this, `startPollingWalletInfo`, `observable completed.`, ConsoleTheme.testing)
				)
		}

		// The first run
		getAsyncWalletInfo()

		// The periodic run
		this.stopPollingWalletInfo()
		walletInfoPollingIntervalId = setInterval(
			() => getAsyncWalletInfo(),
			walletInfoPollingIntervalSetting
		)
	}

	/**
	 * @memberof ResistanceCliService
	 */
	stopPollingTransactionsDataFromWallet() {
		if (transactionDataFromWalletPollingIntervalId !== -1) {
			clearInterval(transactionDataFromWalletPollingIntervalId)
			transactionDataFromWalletPollingIntervalId = -1
		}
	}

	/**
	 * Polling the wallet transactions per 5 second (after the first run)
	 *
	 * @memberof ResistanceCliService
	 */
	startPollingTransactionsDataFromWallet() {
		/**
		 *
		 */
		const getAsyncTransactionDataFromWallet = async () => {

			const getDirection = (value: string) => {
				if (value === 'receive') return 'In'
				else if (value === 'send') return 'Out'
				else if (value === 'generate') return 'Mined'
				else if (value === 'immature') return 'Immature'

				return value
			}

			const getConfirmed = (value: number) => (value !== 0 ? 'Yes' : 'No')

			const getAmount = (value: number | string) => {
				const tempFloat = typeof value === 'string' ? parseFloat(value).toFixed(2) : value.toFixed(2)
				return tempFloat.startsWith('-') ? tempFloat.substring(1) : tempFloat
			}

			const getDate = (value: number) => {
				const tempDate = new Date(value * 1000)
				return getFormattedDateString(tempDate)
			}

			const cli = getResistanceClientInstance()
			const getPublicTransactionsCmd = () => [
				{ method: 'listtransactions', parameters: ['', 200] }
			]
			const getWalletZAddressesCmd = () => [{ method: 'z_listaddresses' }]
			const getWalletZReceivedTransactionsCmd = (zAddress) => [{ method: 'z_listreceivedbyaddress', parameters: [zAddress, 0] }]
			const getWalletTransactionCmd = (transactionId) => [{ method: 'gettransaction', parameters: [transactionId] }]

			// t_add --> t_addr:

			// Public --- IN --- t_addr
			// Public --- OUT --- t_addr

			// t_add --> z_addr:

			// Public -- OUT -- Z Address not listed in Wallet
			// Private -- IN -- z_Addr

			// z_add --> t_addr

			// Public -- IN -- t_addr
			// Private -- IN -- z_addr

			// z_add --> z_addr

			// Private  -- IN -- z_addr1
			// Private -- IN -- z_addr2

			const getPrivateTransactionsPromise = async () => {
				try {
					// First, we get all the private addresses, and then for each one, we get all their transactions
					const privateAddresses = await cli.command(getWalletZAddressesCmd()).then(tempResult => tempResult[0])
					if (Array.isArray(privateAddresses) && privateAddresses.length > 0) {
						let queryResultWithAddressArr = []
						for (let index = 0; index < privateAddresses.length; index++) {
							const tempAddress = privateAddresses[index];
							/* eslint-disable-next-line no-await-in-loop */
							const addressTransactions = await cli.command(getWalletZReceivedTransactionsCmd(tempAddress)).then(tempResult => tempResult[0])

							// 	 [{
							// 	 amount: 49.9999,
							// 	 jsindex: 0,
							// 	 jsoutindex: 1,
							// 	 memo: "f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
							// 	 txid: "1bf41fc600962cc22104d1e2884527537a0d8d8eaac97fbabb1d5887b73ee066"
							// 	 }]
							if (Array.isArray(addressTransactions) && addressTransactions.length > 0) {
								const addressTransactionsWithPrivateAddress = addressTransactions.map(tran => Object.assign({}, tran, { address: tempAddress }))
								queryResultWithAddressArr = [...queryResultWithAddressArr, ...addressTransactionsWithPrivateAddress]
							}
						}

						// this.logger.debug(this, `getPrivateTransactionsPromise`, `queryResultWithAddressArr: `, ConsoleTheme.testing, queryResultWithAddressArr)

						const tempTransactionList = queryResultWithAddressArr.map(result => ({
							type: `\u2605 T (Private)`,
							direction: getDirection(`receive`),
							confirmed: 0,
							amount: getAmount(result.amount),
							date: null,
							originalTime: 0,
							destinationAddress: result.address,
							transactionId: result.txid
						}))

						// At this moment, we got all transactions for each private address, but each one of them is missing the `confirmations` and `time`,
						// we need to get that info by viewing the detail of the transaction, and then put it back !
						for (let index = 0; index < tempTransactionList.length; index++) {
							const tempTransaction = tempTransactionList[index];
							/* eslint-disable-next-line no-await-in-loop */
							const transactionDetail = await cli.command(getWalletTransactionCmd(tempTransaction.transactionId)).then(tempResult => tempResult[0])
							tempTransaction.confirmed = getConfirmed(transactionDetail.confirmations)
							tempTransaction.date = getDate(transactionDetail.time)
							tempTransaction.originalTime = transactionDetail.time
						}

						return tempTransactionList
					}

					return []
				}
				catch (error) {
					this.logger.debug(this, `startPollingTransactionsDataFromWallet`, `subscribe error: `, ConsoleTheme.error, error)
					return []
				}
			}


			const getPublicTransactionsPromise = cli.command(getPublicTransactionsCmd())
				.then(result => result[0])
				.then(result => {
					if (Array.isArray(result)) {
						return result.map(
							originalTransaction => ({
								type: `\u2605 T (Public)`,
								direction: getDirection(originalTransaction.category),
								confirmed: getConfirmed(originalTransaction.confirmations),
								amount: getAmount(originalTransaction.amount),
								date: getDate(originalTransaction.time),
								originalTime: originalTransaction.time,
								destinationAddress: originalTransaction.address ? originalTransaction.address : `[ Z Address not listed in Wallet ]`,
								transactionId: originalTransaction.txid
							})
						)
					}

					return []
				})
				.catch(error => {
					this.logger.debug(this, `getPublicTransactionsPromise`, `subscribe error: `, ConsoleTheme.error, error)
					return []
				})

			const responseTransactions = { transactions: null, optionalError: null }
			const queryPromiseArr = [
				getPublicTransactionsPromise,
				getPrivateTransactionsPromise()
			]

			const combineQueryPromise = Promise.all(queryPromiseArr)
				.then(result => {
					const combinedTransactionList = [...result[0], ...result[1]]

					// At this point, we got all combined `public address` and `private address` transaction list, but we need to sort by date !!!
					const sortedByDateTransactions = combinedTransactionList.sort((trans1, trans2) => {
						const time1 = trans1.originalTime
						const time2 = trans2.originalTime

						if (time1 > time2) return -1
						else if (time1 < time2) return 1

						return 0
					})
					responseTransactions.transactions = sortedByDateTransactions
					delete responseTransactions.optionalError

					return responseTransactions
				})
				.catch(error => {
					this.logger.debug(this, `startPollingTransactionsDataFromWallet`, `Promise.all error: `, ConsoleTheme.error, error)
					responseTransactions.optionalError = error
					return responseTransactions
				})

			from(combineQueryPromise)
				.pipe(take(1))
				.subscribe(
					result => {
						this.logger.debug(this, `startPollingTransactionsDataFromWallet`, `subscribe result: `, ConsoleTheme.testing, result)

						if (result.transactions && (result.optionalError === null || result.optionalError === undefined)) {
							this.dispatchAction(OverviewActions.gotTransactionDataFromWallet(result.transactions))
						}
					},
					error => this.logger.debug(this, `startPollingTransactionsDataFromWallet`, `subscribe error: `, ConsoleTheme.error, error)
					// () => this.logger.debug(this, `startPollingBlockChainInfo`, `observable completed.`, ConsoleTheme.testing)
				)
		}

		// The first run
		getAsyncTransactionDataFromWallet()

		// The periodic run
		this.stopPollingTransactionsDataFromWallet()
		transactionDataFromWalletPollingIntervalId = setInterval(() => getAsyncTransactionDataFromWallet(), transactionDataFromWalletPollingIntervalSetting)
	}

	/**
	 * @memberof ResistanceCliService
	 */
	stopPollingBlockChainInfo() {
		if (blockchainInfoPollingIntervalId !== -1) {
			clearInterval(blockchainInfoPollingIntervalId)
			blockchainInfoPollingIntervalId = -1
		}
	}

	/**
	 * Polling the block chain info per 5 second (after the first run)
	 *
	 * @memberof ResistanceCliService
	 */
	startPollingBlockChainInfo() {
		/**
		 * @param {*} tempDate
		 */
		const getBlockchainSynchronizedPercentage = (tempDate: Date) => {
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

			// // Just in case early on the call returns some junk date
			// if (info.lastBlockDate.before(startDate)) {
			//     // TODO: write log that we fix minimum date! - this condition should not occur
			//     info.lastBlockDate = startDate
			// }
		}

		/**
		 *
		 */
		const getAsyncBlockchainInfo = () => {
			const cli = getResistanceClientInstance()
			const finalResult: BlockChainInfo = {
				connectionCount: 0,
				blockchainSynchronizedPercentage: 0,
				lastBlockDate: null,
				optionalError: null
			}

			// const getConnectionCountCommand = () => [{ method: 'getconnectioncount' }]
			// const getBlockCountCommand = () => [{ method: 'getblockcount' }]
			// const getBlockHashCommand = (blockIndex: number) => [{ method: 'getblockhash', parameters: [blockIndex] }]
			// const getBlockCommand = (blockhash: string) => [{ method: 'getblock', parameters: [blockhash] }]

			const getBlockChainInfoPromise = cli.getConnectionCount()
				.then(result => {
					finalResult.connectionCount = result
					return cli.getBlockCount()
				})
				.then(result => cli.getBlockHash(result))
				.then(result => cli.getBlock(result))
				.then(result => {
					this.logger.debug(this, `startPollingBlockChainInfo`, `blockInfo`, ConsoleTheme.testing, result)

					finalResult.lastBlockDate = new Date(result.time * 1000)
					finalResult.blockchainSynchronizedPercentage = getBlockchainSynchronizedPercentage(finalResult.lastBlockDate)
					delete finalResult.optionalError
					return finalResult
				})
				.catch(error => {
					console.error(error)
					finalResult.optionalError = error
					return finalResult
				})

			from(getBlockChainInfoPromise)
				.pipe(take(1))
				.subscribe((blockchainInfo: BlockChainInfo) => {
					this.logger.debug(this, `startPollingBlockChainInfo`, `subscribe blockchainInfo: `, ConsoleTheme.testing, blockchainInfo)

					this.dispatchAction(SystemInfoActions.gotBlockChainInfo(blockchainInfo))
				},
					error => this.logger.debug(this, `startPollingBlockChainInfo`, `subscribe error: `, ConsoleTheme.error, error)
					// () => this.logger.debug(this, `startPollingBlockChainInfo`, `observable completed.`, ConsoleTheme.testing)
				)
		}

		// The first run
		getAsyncBlockchainInfo()

		// The periodic run
		this.stopPollingBlockChainInfo()
		blockchainInfoPollingIntervalId = setInterval(
			() => getAsyncBlockchainInfo(),
			blockchainInfoPollingIntervalSetting
		)
	}

	/**
	 * @param {Client} cli
	 * @returns {Promise<any>}
	 * @memberof ResistanceCliService
	 */
	getWalletPrivateAddresses(cli: Client): Promise<any> {
		return cli.command([{ method: 'z_listaddresses' }])
	}

	/**
	 * @param {Client} cli
	 * @returns {Promise<any>}
	 * @memberof ResistanceCliService
	 */
	getWalletAllPublicAddresses(cli: Client): Promise<any> {
		return cli.command([{ method: 'listreceivedbyaddress', parameters: [0, true] }])
	}

	/**
	 * @param {Client} cli
	 * @returns {Promise<any>}
	 * @memberof ResistanceCliService
	 */
	getWalletPublicAddressesWithUnspentOutputs(cli: Client): Promise<any> {
		return cli.command([{ method: 'listunspent', parameters: [0] }])
	}

	/**
	 * @param {Client} cli
	 * @param {string} address
	 * @returns {Promise<any>}
	 * @memberof ResistanceCliService
	 */
	getAddressBalance(cli: Client, addressRow: AddressRow): Promise<any> {
		return cli.command([
			{ method: 'z_getbalance', parameters: [addressRow.address] },
			{ method: 'z_getbalance', parameters: [addressRow.address, 0] }
		])
			.then(result => {
				const confirmedBalance = result[0]
				const unconfirmedBalance = result[1]

				if (confirmedBalance.name === 'RpcError' || unconfirmedBalance.name === 'RpcError') {
					return Object.assign(addressRow, {
						balance: -1,
						confirmed: false,
						errorMessage: confirmedBalance.name === 'RpcError' ? confirmedBalance.message : unconfirmedBalance.message
					})
				}

				const isConfirmed = confirmedBalance === unconfirmedBalance
				const tempBalance = isConfirmed ? confirmedBalance : unconfirmedBalance
				const fixedBalanceStr = typeof tempBalance === 'string' ? parseFloat(tempBalance).toFixed(2) : tempBalance.toFixed(2)

				return Object.assign(addressRow, {
					balance: parseFloat(fixedBalanceStr),
					confirmed: isConfirmed
				})
			})
			.catch(error => {
				this.logger.debug(this, `getAddressBalance`, `Error happen: `, ConsoleTheme.error, error)

				return Object.assign(addressRow, {
					balance: -1,
					confirmed: false,
					errorMessage: error.message
				})
			})
	}

	/**
	 * @param {boolean} [isPrivate]
	 * @returns {Observable<any>}
	 * @memberof ResistanceCliService
	 */
	createNewAddress(isPrivate?: boolean): Observable<any> {
		const cli = getResistanceClientInstance()
		const createNewAddressPromise = cli.command([{ method: isPrivate ? `z_getnewaddress` : `getnewaddress` }])

		return from(createNewAddressPromise).pipe(
			map(result => result[0]),
			tap(newAddress => this.logger.debug(this, `createNewAddress`, `create ${isPrivate ? 'private ' : 'transparent '} address: `, ConsoleTheme.testing, newAddress)),
			catchError(error => {
				this.logger.debug(this, `createNewAddress`, `Error happen: `, ConsoleTheme.error, error)
				return of('')
			})
		)
	}

	/**
	 * @param {string} fromAddress
	 * @param {string} toAddress
	 * @param {number} amountToSend
	 * @returns {Observable<any>}
	 * @memberof ResistanceCliService
	 */
	sendCash(fromAddress: string, toAddress: string, amountToSend: number) {
		const cli = getResistanceClientInstance()

		/**
		 *
		 */
		const getSendCashPromise = (fAddress: string, tAddress: string, amountNeedToSend: number): Promise<any> => {
			const amountAfterDeductTheFransactionFee = amountNeedToSend - 0.0001
			const sendCashParams = [
				fAddress,
				[{ address: tAddress, amount: amountAfterDeductTheFransactionFee }]
			]

			// sendmany "T address here" [{“address”:”t address”, “amount”:0.005}, {“address”:”z address”,”amount”:0.03, “memo”:”f508af…”}]
			return cli.command([{ method: `z_sendmany`, parameters: sendCashParams }])
		}

		getSendCashPromise(fromAddress, toAddress, amountToSend)
			.then(result => {
				const tempResult = result[0]

				// Check error
				if (tempResult.name && tempResult.name === 'RpcError') {
					throw new Error(tempResult.message)
				}

				const operationId = result[0]
				this.logger.debug(this, `sendCash`, `operationId: `, ConsoleTheme.error, operationId)

				return operationId
			})
			.then(operationId => {
				this.stopPollingOperationStatus()
				this.starPollingOperationStatus(operationId)

				return 'done'
			})
			.catch(error => {
				this.logger.debug(this, `sendCash`, `Error happen: `, ConsoleTheme.error, error)

				// Make sure pass "true" to "clearCurrentOperation" !!!
				this.dispatchAction(SendCashActions.sendCashFail(error.message, true))
			})
	}

	/**
	 * @memberof ResistanceCliService
	 */
	stopPollingOperationStatus() {
		if (sendCashPollingIntervalId !== -1) {
			clearInterval(sendCashPollingIntervalId)
			sendCashPollingIntervalId = -1
		}
	}

	/**
	 * @param {string} operationId
	 * @returns {Observable<any>}
	 * @memberof ResistanceCliService
	 */
	starPollingOperationStatus(operationId: string): Observable<any> {
		let initProgressPercent = 0

		const getAsyncOperationStatus = (operId: string) => {
			const cli = getResistanceClientInstance()
			const params = [operId]
			const promise = cli.command([
				{ method: `z_getoperationstatus`, parameters: [params] }
			])

			promise
				.then(result => {
					const tempStatus = result[0][0]

					if (tempStatus && tempStatus.status === 'success') {
						this.stopPollingOperationStatus()

						this.dispatchAction(SendCashActions.sendCashSuccess())
					} else if (tempStatus && tempStatus.status === 'failed') {
						this.stopPollingOperationStatus()

						const failMessage = tempStatus.error && tempStatus.error.message ? tempStatus.error.message : `Unknow error happen.`
						this.dispatchAction(SendCashActions.sendCashFail(failMessage, true))
					} else if (tempStatus && tempStatus.status === 'cancelled') {
						this.stopPollingOperationStatus()

						const failMessage = tempStatus.error && tempStatus.error.message ? tempStatus.error.message : `Operation has been cancelled.`
						this.dispatchAction(SendCashActions.sendCashFail(failMessage, true))
					} else {
						initProgressPercent += 1
						const newProgressPercent =
							initProgressPercent <= 100 ? initProgressPercent : 100
						const inProgressOperation: ProcessingOperation = {
							operationId: tempStatus.id,
							status: tempStatus.status,
							percent: newProgressPercent,
							result: tempStatus.result
						}

						this.dispatchAction(SendCashActions.updateSendOperationStatus(inProgressOperation))
					}

					return 'done'
				})
				.catch(error => {
					this.logger.debug(this, `getAsyncOperationStatus`, `Error happen: `, ConsoleTheme.error, error)

					// Make sure pass "true" to "clearCurrentOperation" !!!
					this.dispatchAction(SendCashActions.sendCashFail(error.message, true))
					this.stopPollingOperationStatus()
				})
		}

		sendCashPollingIntervalId = setInterval(() => getAsyncOperationStatus(operationId), sendCashPollingIntervalSetting)
	}



	/**
	 * @param {boolean} sortByGroupBalance
	 * @param {boolean} disableThePrivateAddress
	 * @returns {Observable<any>}
	 * @memberof ResistanceCliService
	 */
	getWalletAddressAndBalance(sortByGroupBalance?: boolean, disableThePrivateAddress?: boolean): Observable<any> {
		const cli = getResistanceClientInstance()
		const promiseArr = [
			this.getWalletAllPublicAddresses(cli),
			this.getWalletPublicAddressesWithUnspentOutputs(cli),
			this.getWalletPrivateAddresses(cli)
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
						balance: 0,
						confirmed: false,
						address: addr,
						disabled: false
					}))

				this.logger.debug(this, `getWalletAddressAndBalance`, `combinedAddresses: `, ConsoleTheme.testing, combinedAddresses)
				return combinedAddresses
			})
			.then(combinedAddresses => {
				if (Array.isArray(combinedAddresses)) {
					const tempPromiseArr = combinedAddresses.map(tempAddressRow => this.getAddressBalance(cli, tempAddressRow))
					return Promise.all(tempPromiseArr)
				}

				return []
			})
			.then(addresses => {
				this.logger.debug(this, `getWalletAddressAndBalance`, `addresses: `, ConsoleTheme.testing, addresses)

				let addressList = null

				// Sort for each groups
				if (sortByGroupBalance) {
					const publicAddressesBeforeSort = []
					const privateAddressesBeforeSort = []

					for (let index = 0; index < addresses.length; index++) {
						const tempAddressItem = addresses[index];
						if (tempAddressItem.address.startsWith('z')) {
							privateAddressesBeforeSort.push(tempAddressItem)
						} else {
							publicAddressesBeforeSort.push(tempAddressItem)
						}
					}

					const publicAddressesAfterSort = publicAddressesBeforeSort.sort((item1, item2) => item2.balance - item1.balance)
					const privateAddressesAfterSort = privateAddressesBeforeSort.sort((item1, item2) => item2.balance - item1.balance)

					addressList = [...publicAddressesAfterSort, ...privateAddressesAfterSort]
				} else {
					addressList = addresses
				}

				// Show the error to user
				const errorAddressItems = addressList.filter(tempAddressItem => tempAddressItem.balance === -1 && tempAddressItem.errorMessage)
				if (errorAddressItems && errorAddressItems.length > 0) {
					const tempErrorMessage = errorAddressItems
						.map(tempAddressItem => `[${tempAddressItem.address}]:\n ${tempAddressItem.errorMessage}\n\n`)
						.join('\n')
					const showMessge = `Error happen when getting the balance for the addresses below: \n\n${tempErrorMessage}`
					setTimeout(() => this.dialogService.showError(`Address balance error`, showMessge), 500)
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
				this.logger.debug(this, `getWalletAddressAndBalance`, `Error happen: `, ConsoleTheme.error, error)
				return []
			})

		return from(queryPromise).pipe(take(1))
	}
}
