// @flow
import { OSService } from './os-service'


/**
 * ES6 singleton
 */
let instance = null

const osService = new OSService()

const torCommandArgs = []

/**
 * @export
 * @class TorService
 */
export class TorService {
	/**
	 * Creates an instance of TorService.
	 * @memberof TorService
	 */
  constructor() {
    if (!instance) {
      instance = this
    }

    return instance
  }

	/**
	 * @memberof TorService
	 */
  start() {
    osService.execProcess({processName: 'TOR', args: torCommandArgs.slice()})
  }

	/**
	 * @memberof TorService
	 */
  stop() {
    osService.killProcess('TOR')
  }
}
