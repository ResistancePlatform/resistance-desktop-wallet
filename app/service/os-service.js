// @flow
import path from 'path'
import { spawn } from 'child_process'
import { createWriteStream } from 'fs'
import { remote } from 'electron'

/**
 * ES6 singleton
 */
let instance = null

const ps = require('ps-node')

export type ChildProcessName = 'NODE' | 'TOR' | 'MINER'

const ChildProcessCommands = {
  NODE: 'resistanced',
  MINER: 'minerd',
  TOR: 'tor-proxy'
}

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

    // Create a global var to store child processes information for the cleanup
    if (process.type === 'browser' && global.childProcesses === undefined) {
      const childProcesses = {}
      const processNames = ['NODE', 'MINER', 'TOR']

      processNames.forEach(processName => {
        childProcesses[processName] = {
          instance: null,
          isGettingKilled: false
        }
      })

      global.childProcesses = childProcesses
    }

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
	 *
	 * @memberof OSService
	 */
  stopChildProcesses() {
    Object.entries(global.childProcesses).forEach(([processName, item]) => {
      if (item.instance !== null && !item.instance.killed) {
        global.childProcesses[processName].isGettingKilled = true

        console.log(`Killing child process ${processName} with PID ${item.instance.pid}`)

        // childProcess.kill() doesn't work for an unknown reason
        ps.kill(item.instance.pid)
      }
    })
  }

	/**
	 * @memberof OSService
	 * @returns {string}
	 */
	getOS() {
    return process.platform === 'darwin' ? 'macos' : 'windows'
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
	getAppDataPath() {
    return path.join(remote.app.getPath('appData'), 'ResistanceWallet')
	}

	/**
	 * @returns
	 * @memberof OSService
	 */
	getAppSettingFile() {
		const settingFileName = `wallet-settings.json`
    return path.join(this.getAppDataPath(), settingFileName)
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
  execProcess(processName: ChildProcessName, args = []) {
    const actions = this.getSettingsActions()

    const errorHandler = (err) => {
      console.log(`Process ${processName} has failed!`)
      this.dispatchAction(actions.childProcessFailed(processName, err.toString()))
    }

    const command = ChildProcessCommands[processName]

    this.getPid(command).then(pid => {
      if (pid) {
        console.log(`Process ${processName} is already running, PID ${pid}`)
        return this.killPid(pid)
      }
      return Promise.resolve()
    }).then(() => {
      let options
      let isUpdateFinished = false
      const commandPath = path.join(this.getBinariesPath(), command)

      if (this.getOS() === 'macos') {
        options = {
          env: {
            ...process.env,
            DYLD_LIBRARY_PATH: this.getBinariesPath()
          }
        }
      }

      console.log(`Executing command ${commandPath}.`)
      const childProcess = spawn(commandPath, args, options)

      const onUpdateFinished = () => {
        if (!isUpdateFinished) {
          isUpdateFinished = true
          this.dispatchAction(actions.childProcessStarted(processName))
        }
      }

      childProcess.stdout.on('data', onUpdateFinished)
      childProcess.stderr.on('data', onUpdateFinished)

      childProcess.on('error', errorHandler)


      const childProcessInfo = remote.getGlobal('childProcesses')[processName]

      childProcess.on('close', (code) => {
        if (code !== 0) {
          this.dispatchAction(actions.childProcessFailed(processName, `Process ${processName} exited with code ${code}.`))
        } else if (!childProcessInfo.isGettingKilled) {
          this.dispatchAction(actions.childProcessFailed(processName, `Process ${processName} unexpectedly exited.`))
        }

        childProcessInfo.isGettingKilled = false
      })

      const logFile = path.join(this.getAppDataPath(), `${command}.log`)
      const logStream = createWriteStream(logFile, {flags: 'a'});

      childProcess.stdout.pipe(logStream);
      childProcess.stderr.pipe(logStream);

      childProcessInfo.instance = childProcess

      return Promise.resolve()
    }).catch(errorHandler)

  }

	/**
	 * @param {string} processName
	 * @param {string} args
	 * @param {function} errorHandler
	 * @memberof OSService
	 */
  killProcess(processName: ChildProcessName) {
    const actions = this.getSettingsActions()

    this.getPid(ChildProcessCommands[processName]).then(pid => {
      if (pid) {
        const childProcessInfo = remote.getGlobal('childProcesses')[processName]
        childProcessInfo.isGettingKilled = true
        return this.killPid(pid)
      }
      console.log(`Process ${processName} isn't running`)
      return Promise.resolve()
    }).then(() => {
      this.dispatchAction(actions.childProcessMurdered(processName))
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
