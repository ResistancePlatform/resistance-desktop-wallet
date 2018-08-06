// @flow
import { OSService } from './os-service'

/**
 * ES6 singleton
 */
let instance = null

const osService = new OSService()

const minerCommandArgs = ['-o', 'http://127.0.0.1:18232', '--no-stratum', '--no-getwork', '--user=test123', '--pass=test123']

/**
 * @export
 * @class MinerService
 */
export class MinerService {
	/**
	 * Creates an instance of MinerService.
	 * @memberof MinerService
	 */
	constructor() {
		if (!instance) { instance = this }

		return instance
	}

	/**
	 * @memberof MinerService
	 */
	start() {
    const args = osService.getOS() === 'windows' ? minerCommandArgs : minerCommandArgs.concat(['--background'])
    osService.execProcess('MINER', args)
	}

	/**
	 * @memberof MinerService
	 */
	stop() {
    osService.killProcess('MINER')
	}
}
