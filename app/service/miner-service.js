// @flow
import { OSService } from './os-service'

/**
 * ES6 singleton
 */
let instance = null

const { exec } = require('child_process')

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
	 * @returns {Promise<any>}
	 */
	start() {
		return osService.getPid('resistanced').then(daemonPid => {
			console.log(`Resistance daemon PID is: ${daemonPid}`)

      const args = osService.getOS() === 'windows' ? minerArgs : `${minerArgs} --background`
      const command = osService.getCommandString(minerProcess, args)
      console.log(command)

			const execMiner = () => {
				exec(
					command,
					(err, stdout, stderr) => {
						if (err) {
							// Node couldn't execute the command
							console.log(err)
							console.log(`STDOUT: ${stdout}`)
							console.log(`STDERR: ${stderr}`)
						} else {
							// The *entire* stdout and stderr (buffered)
							console.log(`STDOUT: ${stdout}`)
							console.log(`STDERR: ${stderr}`)
						}
					}
				)
			}

			if (daemonPid) {
				return osService.getPid(minerProcess).then(minerPid => {
					if (!minerPid) {
						execMiner()
					} else {
						console.log('Miner is already running')
					}
					return null
				})
			}

			console.log('Daemon must be running to start miner')
			// TODO: add Promise reject

			return null
		})
	}

	/**
	 * @memberof MinerService
	 * @returns {Promise<any>}
	 */
	stop() {
		return new Promise((resolve, reject) => {
			const killMiner = pid => {
				let errorMessage

				if (!pid) {
					errorMessage = `Miner isn't running`
					console.log(errorMessage)
					reject(errorMessage)
				} else {
					osService.killPid(pid, err => {
						if (err) {
							reject(err)
						} else {
							resolve()
						}
					})
				}
			}

			return osService.getPid(minerProcess).then(killMiner)
		})
	}
}
