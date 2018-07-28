// @flow
import { OSService } from './os-service'

/**
 * ES6 singleton
 */
let instance = null

const osService = new OSService()

const minerProcess = 'minerd'
const minerArgs = '-o http://127.0.0.1:18232 --no-stratum --no-getwork --user=test123 --pass=test123'

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
		osService.getPid('resistanced').then(daemonPid => {
      const errorHandler = (err) => { }
			console.log(`Resistance daemon PID is: ${daemonPid}`)

      if (daemonPid) {
        const args = osService.getOS() === 'windows' ? minerArgs : `${minerArgs} --background`
        osService.execProcess(minerProcess, args, errorHandler)
      } else {
        errorMessage = 'Daemon must be running to start miner'
        console.log(errorMessage)
        errorHandler(errorMessage)
      }
		})
	}

	/**
	 * @memberof MinerService
	 */
	stop() {
    const errorHandler = (err) => { }
    osService.killProcess(minerProcess, errorHandler)
	}
}
