// @flow

import Client from 'bitcoin-core'
import { Observable, from, timer } from 'rxjs'
import { map, tap, take } from 'rxjs/operators'
import { LoggerService, ConsoleTheme } from './logger-service'
import { getFormattedDateString } from '../utils/data-util'
import { AppAction } from '../state/reducers/appAction'
import { Balances, Transaction, OverviewActions } from '../state/reducers/overview/overview.reducer'
import { BlockChainInfo, DaemonInfo, SystemInfoActions } from '../state/reducers/system-info/system-info.reducer'

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
const daemonInfoPollingIntervalSetting = 1 * 1000
let blockchainInfoPollingIntervalId = -1
const blockchainInfoPollingIntervalSetting = 5 * 1000
let walletInfoPollingIntervalId = -1
const walletInfoPollingIntervalSetting = 2 * 1000


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
     * @returns {Observable<Balances>}
     * @memberof ResistanceCliService
     */
    getPublicTransactions(): Observable<Balances> {

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

        const getAmount = (value: number) => value.toFixed(2)

        const getDate = (value: number) => {
            const tempDate = new Date(value * 1000)
            return getFormattedDateString(tempDate)
        }

        const cli = getResistanceClientInstance()
        const commandList = [
            { method: 'listtransactions', parameters: ['', 200] }
        ]

        return from(cli.command(commandList))
            .pipe(
                map(result => result[0]),
                map(result => {
                    const transactionList: Array<Transaction> = result.map(originalTransaction => ({
                        type: `T (Public)`,
                        direction: getDirection(originalTransaction.category),
                        confirmed: getConfirmed(originalTransaction.confirmations),
                        amount: getAmount(originalTransaction.amount),
                        date: getDate(originalTransaction.time),
                        destinationAddress: originalTransaction.address,
                        transactionId: originalTransaction.txid
                    }))
                    return transactionList
                })
            )
    }


    /**
     * Polling the daemon status per 1 second, for getting the `resistanced` running status and memory usage
     *
     * @returns {Observable<DaemonInfo>}
     * @memberof ResistanceCliService
     */
    startPollingDaemonStatus(): Observable<DaemonInfo> {
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
     * Polling the wallet info per 2 second
     *
     * @returns {Observable<DaemonInfo>}
     * @memberof ResistanceCliService
     */
    startPollingWalletInfo(): Observable<DaemonInfo> {
        /**
         * 
         */
        const getAsyncWalletInfo = () => {
            const cli = getResistanceClientInstance()
            const commandList = [
                { method: 'z_gettotalbalance' },
                // { method: 'z_gettotalbalance', parameters: [0] },
            ]

            from(cli.command(commandList))
                .pipe(
                    tap(result => this.logger.debug(this, `startPollingWalletInfo`, `result: `, ConsoleTheme.testing, result)),
                    map(result => ({
                        transparentBalance: parseFloat(result[0].transparent),
                        privateBalance: parseFloat(result[0].private),
                        totalBalance: parseFloat(result[0].total) // .toPrecision(10)
                    }))
                )
                .subscribe(
                    (result: Balances) => {
                        this.dispatchAction(OverviewActions.gotWalletInfo(result))
                    },
                    (error) => this.logger.debug(this, `startPollingWalletInfo`, `Error happen: `, ConsoleTheme.error, error),
                // () => this.logger.debug(this, `startPollingWalletInfo`, `observable completed.`, ConsoleTheme.testing)
            );
        }

        // The first run
        getAsyncWalletInfo()

        // The periodic run
        if (walletInfoPollingIntervalId !== -1) {
            clearInterval(walletInfoPollingIntervalId);
            walletInfoPollingIntervalId = -1
        }
        walletInfoPollingIntervalId = setInterval(() => getAsyncWalletInfo(), walletInfoPollingIntervalSetting)
    }

    /**
     * Polling the wallet transactions per 5 second
     *
     * @returns {Observable<DaemonInfo>}
     * @memberof ResistanceCliService
     */
    startPollingTransactionsDatFromWallet(): Observable<DaemonInfo> {
        return timer(100, 5000)
    }

    /**
     * Polling the block chain info per 5 second
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
                    error => this.logger.debug(this, `startPollingBlockChainInfo`, `subscribe blockchainInfo: `, ConsoleTheme.error, error),
                // () => this.logger.debug(this, `startPollingBlockChainInfo`, `observable completed.`, ConsoleTheme.testing)
            )
        }

        // The first run
        getAsyncBlockchainInfo()

        // The periodic run
        if (blockchainInfoPollingIntervalId !== -1) {
            clearInterval(blockchainInfoPollingIntervalId)
            blockchainInfoPollingIntervalId = -1
        }
        blockchainInfoPollingIntervalId = setInterval(() => getAsyncBlockchainInfo(), blockchainInfoPollingIntervalSetting)
    }
}