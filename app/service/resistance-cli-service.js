// @flow

import Client from 'bitcoin-core'
import { Observable, from } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { Balances } from '../state/reducers/overview/overview.reducer'

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
    geBalance(): Observable<Balances> {
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
}