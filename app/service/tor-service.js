// @flow
import { OSService } from './os-service'
import { SettingsActions } from '../state/reducers/settings/settings.reducer'


/**
 * ES6 singleton
 */
let instance = null

const util = require('util')

const osService = new OSService()

const torProcess = 'tor-proxy'
const startTorString = `${torProcess}`

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
    const errorHandler = (err) => {
      osService.dispatchAction(SettingsActions.torProcessFailed(`${err}`))
    }
    osService.execProcess(torProcess, '', errorHandler)
  }

	/**
	 * @memberof TorService
	 */
  stop() {
    const errorHandler = (err) => {
      osService.dispatchAction(SettingsActions.torProcessMurderFailed(`${err}`))
    }
    osService.killProcess(torProcess, errorHandler)
  }
}
