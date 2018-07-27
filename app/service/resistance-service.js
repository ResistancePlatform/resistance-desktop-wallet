// @flow
import { OSService } from './os-service'

/**
 * ES6 singleton
 */
let instance = null

const { exec } = require('child_process')

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
	 * @returns {Promise<any>}
	 */
	start(isTorEnabled: boolean) {
		let command

		return osService.getPid(resistancedProcess).then(daemonPid => {
			const execDaemon = () => {
				exec(command, (err, stdout, stderr) => {
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
				})
			}

			if (!daemonPid) {
        const args = isTorEnabled ? `${args} ${torSwitch}` : resistancedArgs
        command = osService.getCommandString(resistancedProcess, args)
				execDaemon()
			} else {
				console.log('Daemon is already running')
			}

			return null
		})
	}

	/**
	 * @memberof ResistanceService
	 * @returns {Promise<any>}
	 */
	stop() {
		return new Promise((resolve, reject) => {
			const killDaemon = pid => {
				if (!pid) {
					const errorMessage = "Daemon isn't running"
					console.log(errorMessage)
					reject(errorMessage)
				} else {
					osService
						.killPid(pid)
						.then(() => {
							console.log('Process %s has been killed!', pid)
							resolve()
							return null
						})
						.catch(err => {
							reject(err)
						})
				}
			}

			return osService.getPid(resistancedProcess).then(killDaemon)
		})
	}
}
