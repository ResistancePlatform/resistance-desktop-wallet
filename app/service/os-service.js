// @flow

/**
 * ES6 singleton
 */
let instance = null

const ps = require('ps-node')

/**
 * @export
 * @class OSService
 */
export class OSService {
	/**
	 * Creates an instance of OSService.
	 * @memberof OSService
	 */
	constructor() {
		if (!instance) { instance = this}

		return instance
	}

	/**
	 * @memberof OSService
	 * @returns {string}
	 */
	getOS() {
		if (process.platform === 'darwin') {
			return 'macos'
		}
		return 'windows'
	}

	/**
	 * @memberof OSService
	 * @returns {string}
	 */
	getBinariesPath() {
		return `${__dirname}/bin/${this.getOS()}`
	}

	/**
	 * @param {string} pid
	 * @memberof OSService
	 * @returns {Promise<any>}
	 */
	killPid(pid) {
		return new Promise((resolve, reject) => {
			ps.kill(pid, err => {
				if (err) {
					reject(err)
				}
				console.log('Process %s has been killed!', pid)
				resolve()
			})
		})
	}

	/**
	 * @param {string} processName
	 * @memberof OSService
	 * @returns {Promise<number>}
	 */
	getPid(processName: string) {
		return new Promise((resolve, reject) => {
			let process

			ps.lookup(
				{
					command: processName
				},
				(err, resultList) => {
					if (err) {
						reject(err)
					}

					[process] = resultList

					if (process) {
						resolve(process.pid)
						console.log(
							'PID: %s, COMMAND: %s, ARGUMENTS: %s',
							process.pid,
							process.command,
							process.arguments
						)
					} else {
						resolve(0)
						console.log('No such process found!')
					}
				}
			)
		})
	}
}
