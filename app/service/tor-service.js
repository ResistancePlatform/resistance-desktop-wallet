// @flow
import { OSService } from './os-service'
import { SettingsActions } from '../state/reducers/settings/settings.reducer'

/**
 * ES6 singleton
 */
let instance = null

const util = require('util')
const exec = util.promisify(require('child_process').exec)

const osService = new OSService()

let torPid
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
      osService.dispatchAction(SettingsActions.failTorProcess(`${err}`))
    }

    osService.getPid(torProcess).then(pid => {
      if (!pid) {
        const command = osService.getCommandString(torProcess)
        console.log(command)

        exec(command).catch((err) => {
          console.log('Tor process failed!')
          console.log(`stdout: ${err.stdout}`)
          console.log(`stderr: ${err.stderr}`)
          errorHandler(err)
        })

      } else {
        console.log('Tor is already running')
      }
    }).catch((err) => {
      errorHandler(err)
    })
  }

	/**
	 * @memberof TorService
	 */
  stop() {
    const errorHandler = (err) => {
      osService.dispatchAction(SettingsActions.failTorProcessMurder(`${err}`))
    }

    osService.getPid('tor-proxy').then(pid => {
      if (!pid) {
        console.log("Tor isn't running")
      } else {
        osService.killPid(pid).then(() => {
          console.log('Process %s has been killed!', pid)
        }).catch((err) => {
          errorHandler(err)
        })
      }
    }).catch((err) => {
      errorHandler(err)
    })

  }
}
