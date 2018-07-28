// @flow
import { OSService } from './os-service'
import { SettingsActions } from '../state/reducers/settings/settings.reducer'

/**
 * ES6 singleton
 */
let instance = null

const osService = new OSService()

const resistancedArgs = '-testnet'
const resistancedProcess = 'resistanced'
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
    const errorHandler = (err) => {
      osService.dispatchAction(SettingsActions.failLocalNodeProcess(`${err}`))
    }
    const args = isTorEnabled ? `${resistancedArgs} ${torSwitch}` : resistancedArgs
    osService.execProcess(resistancedProcess, args, errorHandler)
	}

	/**
	 * @memberof ResistanceService
	 */
	stop() {
    const errorHandler = (err) => { }
    osService.killProcess(resistancedProcess, errorHandler)
	}
}
