// @flow

import Client from 'bitcoin-core'
import { Observable, from, timer } from 'rxjs'
import { map, tap, take } from 'rxjs/operators'
import { getFormattedDateString } from '../utils/data-util'
import { Balances, Transaction } from '../state/reducers/overview/overview.reducer'
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


/**
 * @export
 * @class ResistanceCliService
 */
export class ResistanceCliService {

    /**
     *Creates an instance of ResistanceCliService.
     * @memberof ResistanceCliService
     */
    constructor() {
        if (!instance) {
            instance = this
        }

        this.time = new Date()
        // this.logger.debug(this, `constructor`, `ResistanceCliService created.`, ConsoleTheme.testing)

        return instance
    }


    /**
     * @returns {Observable<Balances>}
     * @memberof ResistanceCliService
     */
    getBalance(): Observable<Balances> {
        const cli = getResistanceClientInstance()
        const commandList = [
            { method: 'z_gettotalbalance', parameters: ['', 1, false] }
        ]

        return from(cli.command(commandList))
            .pipe(
                map(result => ({
                    transparentBalance: parseFloat(result[0].transparent),
                    privateBalance: parseFloat(result[0].private),
                    totalBalance: parseFloat(result[0].total) // .toPrecision(10)
                })),
                tap(balances => console.log(`balances: `, balances))
            )
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
     * Polling the daemon status per 1 second
     *
     * @returns {Observable<DaemonInfo>}
     * @memberof ResistanceCliService
     */
    startPollingDaemonStatus(): Observable<DaemonInfo> {
        return timer(100, 1000)
    }

    /**
     * Polling the wallet balance per 2 second
     *
     * @returns {Observable<DaemonInfo>}
     * @memberof ResistanceCliService
     */
    startPollingWalletBalance(): Observable<DaemonInfo> {
        return timer(100, 2000)
    }

    /**
     * Polling the wallet transactions per 5 second
     *
     * @returns {Observable<DaemonInfo>}
     * @memberof ResistanceCliService
     */
    startPollingWalletTransactions(): Observable<DaemonInfo> {
        return timer(100, 5000)
    }

    /**
     * Polling the block chain info per 5 second
     *
     * @memberof ResistanceCliService
     */
    startPollingBlockChainInfo() {

        /**
         * 
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
                return  parseFloat(dPercentage.toFixed(2))
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
                    console.log(`blockInfo: ${JSON.stringify(result, null, 4)}`)
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
                    take(1),
                    tap(blockchainInfo => console.log(`blockchainInfo from tap: `, blockchainInfo))
                )
                .subscribe(
                    (blockchainInfo: BlockChainInfo) => {
                        console.log(`blockchainInfo: `, blockchainInfo)

                        /**
                         * We CANNOT use:
                         *   import { appStore } from '../state/store/configureStore'
                         * 
                         * As that will import BEFORE the `appStore` be created !!!
                         * We have to require the latest `appStore` to make sure it has been created !!!
                         */
                        const storeModule = require('../state/store/configureStore')
                        console.log(`appStore: `, storeModule.appStore)
                        if (storeModule.appStore) {
                            storeModule.appStore.dispatch(SystemInfoActions.gotBlockChainInfo(blockchainInfo))

                            const daemonInfo: DaemonInfo = {
                                status: 'RUNNING',
                                residentSizeMB: 0
                            }

                            if (blockchainInfo.optionalError) {
                                if (blockchainInfo.optionalError.code && blockchainInfo.optionalError.code === 'ECONNREFUSED') {
                                    daemonInfo.status = 'NOT_RUNNING'
                                } else {
                                    daemonInfo.status = 'UNABLE_TO_ASCERTAIN'
                                }
                            }

                            storeModule.appStore.dispatch(SystemInfoActions.gotDaemonInfo(daemonInfo))
                        }
                    },
                    error => console.error(`error: `, error),
                    () => console.log(`observable completed.`)
                )
        }

        // The first run
        getAsyncBlockchainInfo()

        // The periodic run
        setInterval(() => getAsyncBlockchainInfo(), 5000)
    }
}