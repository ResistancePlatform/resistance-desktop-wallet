// @flow
import { remote } from 'electron'
import path from 'path'
import { exec } from 'child_process'


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
		if (!instance) { instance = this }

		return instance
	}

	/**
	 * We CANNOT use:
	 *   import { appStore } from '../state/store/configureStore'
	 *
	 * As that will import BEFORE the `appStore` be created !!!
	 * We have to require the latest `appStore` to make sure it has been created !!!
	 *
	 * @param {AppAction} action
	 * @memberof ResistanceCliService
	 */
	dispatchAction(action: AppAction) {
		const storeModule = require('../state/store/configureStore')
		if (storeModule && storeModule.appStore) {
			storeModule.appStore.dispatch(action)
		}
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
		let resourcesPath

		if (/[\\/](Electron\.app|Electron|Electron\.exe)[\\/]/i.test(process.execPath)) {
			resourcesPath = process.cwd()
		} else {
			resourcesPath = process.resourcesPath
		}

		return path.join(resourcesPath, 'bin', this.getOS())
	}

	/**
	 * @memberof OSService
	 */
	getLogString(logFileName: string) {
    const fullPath = path.join(this.getAppDataPath(), logFileName)
    return this.getOS() == 'windows' ?  ` > "${fullPath}" 2>&1` : ` &> "${fullPath}"`
	}

  getCommandString(command, args = '') {
    const fullPath = path.join(this.getBinariesPath(), command)
    const logString = this.getLogString(`${command}.log`)
    return `${fullPath} ${args} ${logString}`
  }

	/**
	 * @memberof OSService
	 */
	getAppDataPath() {
    return path.join(remote.app.getPath('appData'), 'ResistanceWallet')
	}

	/**
	 * @returns
	 * @memberof OSService
	 */
	getAppSettingFile() {
		const settingFileName = `wallet-settings.json`
		return (this.getOS() === `macos`) ? `${this.getAppDataPath()}/${settingFileName}` : `${this.getAppDataPath()}\\${settingFileName}`
	}

	/**
	 * @param {string} processName
	 * @param {string} args
	 * @param {function} errorHandler
	 * @memberof OSService
	 */
  execProcess(processName, args = '', errorHandler = (err) => {}) {
    this.getPid(processName).then(pid => {
      if (!pid) {
        const command = this.getCommandString(processName, args)
        console.log(`Executing command:`, command)

        const pid = exec(command, (err, stdout, stderr) => {
          if (err) {
            console.log(`Process ${processName} has failed!`)
            console.log(`stdout: ${stdout}`)
            console.log(`stderr: ${stderr}`)
            errorHandler(err)
          }
        }).pid

      } else {
        console.log(`Process ${processName} is already running`)
      }
    }).catch((err) => {
      errorHandler(err)
    })
  }

	/**
	 * @param {string} processName
	 * @param {string} args
	 * @param {function} errorHandler
	 * @memberof OSService
	 */
  killProcess(processName, errorHandler = (err) => {}) {
    this.getPid(processName).then(pid => {
      if (!pid) {
        console.log(`Process ${processName} isn't running`)
      } else {
        this.killPid(pid).then(() => {
          console.log('Process %s has been killed!', pid)
        }).catch((err) => {
          errorHandler(err)
        })
      }
    }).catch((err) => {
      errorHandler(err)
    })
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
