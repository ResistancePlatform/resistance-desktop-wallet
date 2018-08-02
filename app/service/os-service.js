// @flow
import path from 'path'
import { remote } from 'electron'
import { spawn } from 'child_process'

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
	 * @param {Object} action
	 * @memberof ResistanceCliService
	 */
	dispatchAction(action) {
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
			[resourcesPath] = process.resourcesPath
		}

		return path.join(resourcesPath, 'bin', this.getOS())
	}

	/**
	 * @memberof OSService
	 */
	getLogString(logFileName: string) {
    const fullPath = path.join(this.getAppDataPath(), logFileName)
    return this.getOS() === 'windows' ?  ` > "${fullPath}" 2>&1` : ` &> "${fullPath}"`
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
   * Avoid circular dependency in appState.js
   *
	 * @returns {SettingsActions}
	 * @memberof OSService
	 */
  getSettingsActions() {
    const settingsReducerModule = require('../state/reducers/settings/settings.reducer')
    return settingsReducerModule.SettingsActions
  }

	/**
	 * @param {string} processName
	 * @param {string[]} args
	 * @memberof OSService
	 */
  execProcess(processName, args = []) {
    const actions = this.getSettingsActions()

    const errorHandler = (err) => {
      console.log(`Process ${processName} has failed!`)
      this.dispatchAction(actions.childProcessFailed(processName, err.toString()))
    }

    this.getPid(processName).then(pid => {
      if (pid) {
        console.log(`Process ${processName} is already running`)
        return this.killPid(pid)
      }
      return Promise.resolve()
    }).then(() => {
      let options
      let isUpdateFinished = false
      const commandPath = path.join(this.getBinariesPath(), processName)

      if (this.getOS() === 'macos') {
        options = {
          env: Object.assign({}, process.env, {
            DYLD_LIBRARY_PATH: `"${this.getBinariesPath()}"`
          })
        }
      }

      console.log(`Executing command ${commandPath}.`)
      const childProcess = spawn(commandPath, args, options)

      this.dispatchAction(actions.childProcessUpdateStarted(processName))

      const onUpdateFinished = () => {
        if (!isUpdateFinished) {
          isUpdateFinished = true
          this.dispatchAction(actions.childProcessUpdateFinished(processName))
        }
      }

      childProcess.stdout.on('data', onUpdateFinished)
      childProcess.stderr.on('data', onUpdateFinished)

      childProcess.on('error', errorHandler)

      return Promise.resolve()
    }).catch(errorHandler)

  }

	/**
	 * @param {string} processName
	 * @param {string} args
	 * @param {function} errorHandler
	 * @memberof OSService
	 */
  killProcess(processName) {
    const actions = this.getSettingsActions()

    this.dispatchAction(actions.childProcessUpdateStarted(processName))

    this.getPid(processName).then(pid => {
      if (pid) {
        return this.killPid(pid)
      }
      console.log(`Process ${processName} isn't running`)
      return Promise.resolve()
    }).then(() => {
      this.dispatchAction(actions.childProcessUpdateFinished(processName))
      return Promise.resolve()
    }).catch((err) => {
      this.dispatchAction(actions.childProcessMurderFailed(processName, err.toString()))
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
				resolve(pid)
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
