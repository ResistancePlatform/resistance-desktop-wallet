// @flow
import { OSService } from './os-service'

/**
 * ES6 singleton
 */
let instance = null

const osService = new OSService()

const resistancedArgs = ['-testnet']
const torSwitch = '-proxy=127.0.0.1:9050'

/**
 * @export
 * @class ResistanceService
 */
export class ResistanceService {
	/**
	 * Creates an instance of ResistanceService.
	 * @memberof ResistanceService
	 */
	constructor() {
		if (!instance) { instance = this }

		return instance
	}

	/**
	 * @memberof ResistanceService
	 */
	start(isTorEnabled: boolean) {
    const args = isTorEnabled ? resistancedArgs.concat([torSwitch]) : resistancedArgs
    osService.execProcess('NODE', args)
	}

	/**
	 * @memberof ResistanceService
	 */
	stop() {
    const errorHandler = () => { }
    osService.killProcess('NODE', errorHandler)
	}
}
