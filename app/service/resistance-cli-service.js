// @flow
import { Observable, of } from 'rxjs'
import { Balances } from '../state/reducers/overview/overview.reducer'

let instance = null

/**
 * @export
 * @class ResistanceCliService
 */
export class ResistanceCliService {

    time: Date

    /**
     * Disable constructor
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

    geBalance(): Observable<Balances> {
        const newBalance: Balances = {
            transparentBalance: 888.68,
            privateBalance: 123.45,
            totalBalance: 1012.13
        }
        return of(newBalance)
    }
}