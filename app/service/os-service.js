// @flow
/* eslint-disable global-require */
import * as fs from 'fs';
import path from 'path'
import log from 'electron-log'
import { spawn } from 'child_process'
import { app, remote } from 'electron'

/**
 * ES6 singleton
 */
let instance = null

const ps = require('ps-node')

export type ChildProcessName = 'NODE' | 'TOR' | 'MINER' | 'MARKET_MAKER'
export type ChildProcessStatus = 'RUNNING' | 'STARTING' | 'RESTARTING' | 'FAILED' | 'STOPPING' | 'MURDER FAILED' | 'NOT RUNNING'

const ChildProcessCommands = {
  NODE: 'resistanced',
  MINER: 'minerd',
  TOR: 'tor-proxy',
  MARKET_MAKER: 'marketmaker'
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
    if (!instance) {
      instance = this
    }

    // Create a global var to store child processes information for the cleanup
    if (process.type === 'browser' && global.childProcesses === undefined) {
      const childProcesses = {}
      const processNames = ['NODE', 'MINER', 'TOR', 'MARKET_MAKER']

      processNames.forEach(processName => {
        childProcesses[processName] = {
          pid: null,
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
	 *   import { appStore } from '../store/configureStore'
	 *
	 * As that will import BEFORE the `appStore` be created !!!
	 * We have to require the latest `appStore` to make sure it has been created !!!
	 *
	 * @param {Object} action
	 * @memberof RpcService
	 */
	dispatchAction(action) {
		const storeModule = require('~/store/configureStore')
		if (storeModule && storeModule.appStore) {
			storeModule.appStore.dispatch(action)
		}
	}

	/**
	 * Returns child process status alarm color, 'green', 'red' or 'yellow'
   *
	 * @param {Object} action
	 * @memberof RpcService
	 */
  getChildProcessStatusColor(processStatus) {
    switch (processStatus) {
      case 'RUNNING':
        return 'green'
      case 'STARTING':
      case 'RESTARTING':
      case 'STOPPING':
        return 'yellow'
      case 'NOT RUNNING':
      case 'FAILED':
      case 'MURDER FAILED':
        return 'red'
      default:
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

        log.info(`Killing child process ${processName} with PID ${item.instance.pid}`)

        // childProcess.kill() doesn't work for an unknown reason
        if (item.pid) {
          ps.kill(item.pid)
        } else {
          ps.kill(item.instance.pid)
        }
      }
    })
  }

	/**
   * Returns a common name/alias for each OS family
   *
	 * @memberof OSService
	 * @returns {string}
	 */
	getOS() {
    let os = 'linux'
    if (process.platform === 'darwin') {
      os = 'macos'
    } else if (process.platform === 'win32') {
      os = 'windows'
    }
    return os
	}

	/**
   * Returns application install path.
   *
	 * @memberof OSService
	 * @returns {string}
	 */
  getInstallationPath() {
    const validApp = process.type === 'renderer' ? remote.app : app
    let walkUpPath
    switch (this.getOS()) {
      case 'windows':
        walkUpPath = '/../../../'
        break
      case 'macos':
        walkUpPath = '/../../../../'
        break
      case 'linux':
        walkUpPath = '/../../../../..'
        break
    }
    log.info(validApp.getAppPath())
    return path.join(validApp.getAppPath(), walkUpPath)
  }

	/**
	 * @memberof OSService
	 * @returns {string}
	 */
	getBinariesPath() {
		const resourcesPath = this.getResourcesPath()
		return path.join(resourcesPath, 'bin', this.getOS())
	}

	/**
   * Returns correct resource path for both development and production environments.
   *
	 * @memberof OSService
	 * @returns {string}
	 */
  getResourcesPath() {
		let resourcesPath

		if (/[\\/](Electron\.app|Electron|Electron\.exe)[\\/]/i.test(process.execPath)) {
			resourcesPath = process.cwd()
		} else {
      ({ resourcesPath } = process)
		}

    return resourcesPath
  }

	/**
	 * @memberof OSService
	 */
	getAppDataPath() {
    const validApp = process.type === 'renderer' ? remote.app : app
    return path.join(validApp.getPath('appData'), 'ResistanceWallet')
	}

	/**
   * Avoid circular dependency in types.js
   *
	 * @returns {SettingsActions}
	 * @memberof OSService
	 */
  getSettingsActions() {
    const settingsReducerModule = require('~/reducers/settings/settings.reducer')
    return settingsReducerModule.SettingsActions
  }

  getLogFilePath(processName: string) {
    const command = ChildProcessCommands[processName]
    return  path.join(this.getAppDataPath(), `${command}.log`)
  }

	/**
   * Restarts a child process by name using killProcess() and execProcess() methods.
   *
	 * @param {string} processName
	 * @param {string[]} args
	 * @param {function} stdoutHandler If returns true the process is considered started.
	 * @memberof OSService
	 */
  restartProcess(processName: ChildProcessName, args = [], stdoutHandler) {
    log.info(`Restarting ${processName} process.`)
    this.killProcess(processName, () => {
      this.execProcess(processName, args, stdoutHandler)
    })
  }

	/**
   * Starts a child process with a given name and sends status update messages.
   *
	 * @param {string} processName
	 * @param {string[]} args
	 * @param {function} stdoutHandler If returns true the process is considered started.
	 * @memberof OSService
	 */
  execProcess(processName: ChildProcessName, args = [], stdoutHandler) {
    const actions = this.getSettingsActions()

    const errorHandler = (err) => {
      console.error(`Process ${processName} has failed!`)
      this.dispatchAction(actions.childProcessFailed(processName, err.toString()))
    }

    const command = ChildProcessCommands[processName]

    this.killProcess(processName, () => {}).then(() => {
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

      const childProcessInfo = remote.getGlobal('childProcesses')[processName]

      log.info(`Executing command ${commandPath} with arguments ${args.join(' ')}.`)
      const childProcess = spawn(commandPath, args, options)

      const onData = (data: Buffer) => {
        if (stdoutHandler) {
          const handlerResult = stdoutHandler(data)

          if (typeof(handlerResult) === 'boolean' && handlerResult !== true) {
            return
          }
        }

        if (!isUpdateFinished) {
          isUpdateFinished = true
          this.dispatchAction(actions.childProcessStarted(processName))

          // Pid can be different from the instance for the Miner
          this.getPid(command).then(pid => {
            childProcessInfo.pid = pid
            return Promise.resolve()
          }).catch()

        }

      }

      childProcess.stdout.on('data', onData)
      childProcess.stderr.on('data', onData)

      childProcess.on('error', errorHandler)

      childProcess.on('close', (code) => {
        if (!childProcessInfo.isGettingKilled) {
          // Avoid circular dependency
          const t = require('../i18next.config').i18n.getFixedT(null, 'service')
          const errorMessage =  t(`Process {{processName}} unexpectedly exited with code {{code}}.`, { processName, code })
          this.dispatchAction(actions.childProcessFailed(processName, errorMessage))
        }

        childProcessInfo.isGettingKilled = false
      })

      const logFile = this.getLogFilePath(processName)
      const logStream = fs.createWriteStream(logFile, {flags: 'a'})

      childProcess.stdout.pipe(logStream)
      childProcess.stderr.pipe(logStream)

      childProcessInfo.instance = childProcess

      return Promise.resolve()
    }).catch(errorHandler)

  }

	/**
   * Kills a child process by name and sends status update messages.
   * Provide customSuccessHandler to suppress CHILD_PROCESS_MURDERED message.
   *
	 * @param {string} processName
	 * @param {function} customSuccessHandler
   * @returns {Promise}
	 * @memberof OSService
	 */
  killProcess(processName: ChildProcessName, customSuccessHandler) {
    const actions = this.getSettingsActions()

    const promise = this.getPid(ChildProcessCommands[processName]).then(pid => {
      if (pid) {
        const childProcessInfo = remote.getGlobal('childProcesses')[processName]
        childProcessInfo.isGettingKilled = true
        return this.killPid(pid)
      }
      log.info(`Process ${processName} isn't running`)
      return Promise.resolve()
    }).then(() => {
      if (customSuccessHandler) {
        customSuccessHandler()
      } else {
        this.dispatchAction(actions.childProcessMurdered(processName))
      }
      return Promise.resolve()
    }).catch((err) => {
      this.dispatchAction(actions.childProcessMurderFailed(processName, err.toString()))
    })

    return promise
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
				log.info('Process %s has been killed!', pid)
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
					} else {
						resolve(0)
						log.info('No such process found!')
					}
				}
			)
		})
	}

	/**
   * Moves a file from one path to another, supports cross partitions and virtual file systems.
   *
	 * @param {string} fromPath
	 * @param {string} toPath
	 * @memberof OSService
	 * @returns {Promise<any>}
	 */
  moveFile(fromPath, toPath) {
    const readStream = fs.createReadStream(fromPath)
    const writeStream = fs.createWriteStream(toPath)

    const promise = new Promise((resolve, reject) => {
      readStream.on('error', err => reject(err))
      writeStream.on('error', err => reject(err))

      readStream.on('close', () => {
        fs.unlink(fromPath, unlinkError => unlinkError ? reject(unlinkError) : resolve())
      });

      readStream.pipe(writeStream)
    })

    return promise
  }
}
