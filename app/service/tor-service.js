// @flow

import { OSService } from './os-service'

/**
 * ES6 singleton
 */
let instance = null

const { exec } = require('child_process')

const osService = new OSService()

const torProcess = 'tor-proxy'
const startTorString = `${torProcess}`
const torLog = ' &> tor.log'

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
	 * @returns {Promise<any>}
	 */
	start() {
		return osService.getPid(torProcess).then(pid => {
			if (!pid) {
				const command = `${osService.getBinariesPath()}/${startTorString}${torLog}`
				console.log(command)

				exec(command, (err, stdout, stderr) => {
					if (err) {
						// Node couldn't execute the command
						console.log(err)
						console.log(`stdout: ${stdout}`)
						console.log(`stderr: ${stderr}`)
						return
					}

					// The *entire* stdout and stderr (buffered)
					console.log(`Tor Started Successfully`)
					console.log(`stdout: ${stdout}`)
					console.log(`stderr: ${stderr}`)
				})
			} else {
				console.log('Tor is already running')
			}

			return null
		})
	}

	/**
	 * @memberof TorService
	 */
	stop() {
		return osService.getPid('tor-proxy').then(pid => {
			if (!pid) {
				console.log("Tor isn't running")
			} else {
				return osService.killPid(pid).then(() => {
					console.log('Process %s has been killed!', pid)
					return null
				})
			}
			return null
		})
	}
}
