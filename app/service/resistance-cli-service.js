// @flow

import Client from 'bitcoin-core'
import { Observable, from } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { getFormattedDateString } from '../utils/data-util'
import { Balances, Transaction } from '../state/reducers/overview/overview.reducer'

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
        console.log(`Client:`, Client)
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
            { method: 'z_gettotalbalance', params: ['', 1, false] }
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
            { method: 'listtransactions', params: ['', 200] }
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
                        destinationAddress: originalTransaction.address
                    }))
                    return transactionList
                })
            )
    }
}