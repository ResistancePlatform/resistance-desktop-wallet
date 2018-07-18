// @flow

import Client from 'bitcoin-core'
import { from, Observable } from 'rxjs'
import { map, tap, take } from 'rxjs/operators'
import { LoggerService, ConsoleTheme } from './logger-service'
import { getFormattedDateString } from '../utils/data-util'
import { AppAction } from '../state/reducers/appAction'
import { BlockChainInfo, DaemonInfo, SystemInfoActions } from '../state/reducers/system-info/system-info.reducer'
import { Balances, Transaction, OverviewActions } from '../state/reducers/overview/overview.reducer'
import { AddressRow } from '../state/reducers/own-addresses/own-addresses.reducer'

/**
 * ES6 singleton
 */
let instance = null

/**
 * Get back the new resistance client instance
 */
const getResistanceClientInstance = () => new Client({
    network: 'regtest',
    port: 18432,
    username: 'test123',
    password: 'test123',
    timeout: 500
})

let daemonInfoPollingIntervalId = -1
const daemonInfoPollingIntervalSetting = 2 * 1000
let blockchainInfoPollingIntervalId = -1
const blockchainInfoPollingIntervalSetting = 4 * 1000
let walletInfoPollingIntervalId = -1
const walletInfoPollingIntervalSetting = 2 * 1000
let transactionDataFromWalletPollingIntervalId = -1
const transactionDataFromWalletPollingIntervalSetting = 5 * 1000


/**
 * @export
 * @class ResistanceCliService
 */
export class ResistanceCliService {

    logger: LoggerService

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
                optionalError: null
            }

            const getInfoPromise = cli.getInfo()
                .then(() => {
                    delete (daemonInfo.optionalError)
                    return daemonInfo
                })
                .catch(error => {
                    console.error(error)
                    daemonInfo.optionalError = error
                    return daemonInfo
                })

            from(getInfoPromise)
                .pipe(
                    take(1)
                )
                .subscribe(
                    (result: DaemonInfo) => {
                        const daemonInfoResult = Object.assign(result)

                        if (daemonInfoResult.optionalError) {
                            if (daemonInfoResult.optionalError.code && daemonInfoResult.optionalError.code === 'ECONNREFUSED') {
                                daemonInfoResult.status = 'NOT_RUNNING'
                            } else {
                                daemonInfoResult.status = 'UNABLE_TO_ASCERTAIN'
                            }
                        }

                        this.dispatchAction(SystemInfoActions.gotDaemonInfo(daemonInfoResult))
                    },
                    (error) => this.logger.debug(this, `startPollingDaemonStatus`, `Error happen: `, ConsoleTheme.error, error),
                // () => this.logger.debug(this, `startPollingDaemonStatus`, `observable completed.`, ConsoleTheme.testing)
            );
        }

        // The first run
        getAsyncDaemonInfo()

        // The periodic run
        if (daemonInfoPollingIntervalId !== -1) {
            clearInterval(daemonInfoPollingIntervalId);
            daemonInfoPollingIntervalId = -1
        }
        daemonInfoPollingIntervalId = setInterval(() => getAsyncDaemonInfo(), daemonInfoPollingIntervalSetting)
    }


    /**
     * @memberof ResistanceCliService
     */
    stopPollingWalletInfo() {
        if (walletInfoPollingIntervalId !== -1) {
            clearInterval(walletInfoPollingIntervalId);
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
                { method: 'z_gettotalbalance', parameters: [0] },
            ]

            from(cli.command(commandList))
                .pipe(
                    tap(result => this.logger.debug(this, `startPollingWalletInfo`, `result: `, ConsoleTheme.testing, result)),
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
                    (error) => this.logger.debug(this, `startPollingWalletInfo`, `subscribe error: `, ConsoleTheme.error, error),
                // () => this.logger.debug(this, `startPollingWalletInfo`, `observable completed.`, ConsoleTheme.testing)
            );
        }

        // The first run
        getAsyncWalletInfo()

        // The periodic run
        this.stopPollingWalletInfo()
        walletInfoPollingIntervalId = setInterval(() => getAsyncWalletInfo(), walletInfoPollingIntervalSetting)
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
        const getAsyncTransactionDataFromWallet = () => {

            const getDirection = (value: string) => {
                if (value === 'receive')
                    return 'In'
                else if (value === 'send')
                    return 'Out'
                else if (value === 'generate')
                    return 'Mined'
                else if (value === 'immature')
                    return 'Immature'

                return value
            }

            const getConfirmed = (value: number) => value !== 0 ? 'Yes' : 'No'

            const getAmount = (value: number | string) => {
                const tempFloat = (typeof (value) === 'string') ? parseFloat(value).toFixed(2) : value.toFixed(2)
                return tempFloat > 0 ? tempFloat : -tempFloat
            }

            const getDate = (value: number) => {
                const tempDate = new Date(value * 1000)
                return getFormattedDateString(tempDate)
            }

            const cli = getResistanceClientInstance()
            const getPublicTransactionsCmd = () => [{ method: 'listtransactions', parameters: ['', 200] }]
            // const getWalletZAddressesCmd = () => [{ method: 'z_listaddresses' }]
            // const getWalletZReceivedTransactionsCmd = (zAddress) => [{ method: 'z_listreceivedbyaddress', parameters: [zAddress, 0] }]

            const responseTransactions = { transactions: null, optionalError: null }

            const getPublicTransactionsPromise = cli.command(getPublicTransactionsCmd())
                .then(result => result[0])
                .then(result => {
                    if (Array.isArray(result)) {
                        const transactionList: Array<Transaction> = result.map(originalTransaction => ({
                            type: `T (Public)`,
                            direction: getDirection(originalTransaction.category),
                            confirmed: getConfirmed(originalTransaction.confirmations),
                            amount: getAmount(originalTransaction.amount),
                            date: getDate(originalTransaction.time),
                            destinationAddress: originalTransaction.address,
                            transactionId: originalTransaction.txid
                        }))
                        responseTransactions.transactions = transactionList
                        delete responseTransactions.optionalError
                    } else {
                        // 'result' should be an error
                        responseTransactions.optionalError = result
                    }
                    return responseTransactions
                })
                .catch(error => {
                    console.error(error)
                    responseTransactions.optionalError = error
                    return responseTransactions
                })

            from(getPublicTransactionsPromise)
                .pipe(
                    take(1)
                )
                .subscribe(
                    (result) => {
                        this.logger.debug(this, `startPollingTransactionsDataFromWallet`, `subscribe result: `, ConsoleTheme.testing, result)
                        if (result.transactions && (result.optionalError === null || result.optionalError === undefined)) {
                            this.dispatchAction(OverviewActions.gotTransactionDataFromWallet(result.transactions))
                        }
                    },
                    error => this.logger.debug(this, `startPollingTransactionsDataFromWallet`, `subscribe error: `, ConsoleTheme.error, error),
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
                let dPercentage = 100 - ((remainingTime / fullTime) * 100)
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
                    delete (finalResult.optionalError)
                    return finalResult
                })
                .catch(error => {
                    console.error(error)
                    finalResult.optionalError = error
                    return finalResult
                })

            from(getBlockChainInfoPromise)
                .pipe(
                    take(1)
                )
                .subscribe(
                    (blockchainInfo: BlockChainInfo) => {
                        this.logger.debug(this, `startPollingBlockChainInfo`, `subscribe blockchainInfo: `, ConsoleTheme.testing, blockchainInfo)

                        this.dispatchAction(SystemInfoActions.gotBlockChainInfo(blockchainInfo))
                    },
                    error => this.logger.debug(this, `startPollingBlockChainInfo`, `subscribe error: `, ConsoleTheme.error, error),
                // () => this.logger.debug(this, `startPollingBlockChainInfo`, `observable completed.`, ConsoleTheme.testing)
            )
        }

        // The first run
        getAsyncBlockchainInfo()

        // The periodic run
        this.stopPollingBlockChainInfo()
        blockchainInfoPollingIntervalId = setInterval(() => getAsyncBlockchainInfo(), blockchainInfoPollingIntervalSetting)
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
            { method: 'z_getbalance', parameters: [addressRow.address, 0] },
        ]).then(result => {
            const confirmedBalance = result[0]
            const unconfirmedBalance = result[1]
            const isConfirmed = confirmedBalance === unconfirmedBalance

            return Object.assign(addressRow, {
                balance: isConfirmed ? confirmedBalance : unconfirmedBalance,
                confirmed: isConfirmed
            })
        })
    }

    getWalletOwnAddresses(): Observable<any> {
        const cli = getResistanceClientInstance()
        const promiseArr = [
            this.getWalletPrivateAddresses(cli),
            this.getWalletAllPublicAddresses(cli),
            this.getWalletPublicAddressesWithUnspentOutputs(cli)
        ]

        const queryPromise = Promise.all(promiseArr)
            .then(result => {
                console.log(`result: `, result)
                const privateAddressesResult = result[0][0]
                const PublicAddressesResult = result[1][0]
                const PublicAddressesUnspendResult = result[2][0]

                const addressResultSet = new Set()

                if (Array.isArray(privateAddressesResult)) {
                    const privateAddresses = privateAddressesResult.map(tempValue => tempValue.address)
                    for (let index = 0; index < privateAddresses.length; index++) {
                        addressResultSet.add(privateAddresses[index])
                    }
                }

                if (Array.isArray(PublicAddressesResult)) {
                    const publicAddresses = PublicAddressesResult.map(tempValue => tempValue.address)
                    for (let index = 0; index < publicAddresses.length; index++) {
                        addressResultSet.add(publicAddresses[index])
                    }
                }

                if (Array.isArray(PublicAddressesUnspendResult)) {
                    const publicAddresses = PublicAddressesUnspendResult.map(tempValue => tempValue.address)
                    for (let index = 0; index < publicAddresses.length; index++) {
                        addressResultSet.add(publicAddresses[index])
                    }
                }

                const combinedAddresses = Array.from(addressResultSet).map(addr => ({
                    balance: 0,
                    confirmed: false,
                    address: addr
                }))
                this.logger.debug(this, `getWalletOwnAddresses`, `combinedAddresses: `, ConsoleTheme.testing, combinedAddresses)
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
                this.logger.debug(this, `getWalletOwnAddresses`, `addresses: `, ConsoleTheme.testing, addresses)
                return addresses
            })
            .catch(error => {
                this.logger.debug(this, `getWalletOwnAddresses`, `Error happen: `, ConsoleTheme.error, error)
                return []
            })

        return from(queryPromise).pipe(
            take(1)
        )
    }



}