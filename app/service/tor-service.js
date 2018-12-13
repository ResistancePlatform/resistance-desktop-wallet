// @flow
import { ChildProcessService } from './child-process-service'


/**
 * ES6 singleton
 */
let instance = null

const childProcess = new ChildProcessService()

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
  async start() {
    await childProcess.startProcess({processName: 'TOR', args: torCommandArgs.slice()})
  }

	/**
	 * @memberof TorService
	 */
  async stop() {
    await childProcess.killProcess('TOR')
  }
}
