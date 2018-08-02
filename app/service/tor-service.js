// @flow
import { OSService } from './os-service'


/**
 * ES6 singleton
 */
let instance = null

const osService = new OSService()

const torProcess = 'tor-proxy'
const torProcessArgs = []

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
    osService.execProcess(torProcess, torProcessArgs)
  }

	/**
	 * @memberof TorService
	 */
  stop() {
    osService.killProcess(torProcess)
  }
}
