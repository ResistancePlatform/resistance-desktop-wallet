// @flow
/* eslint-disable global-require */
import path from 'path'
import log from 'electron-log'
import { app, remote } from 'electron'
import ps from 'ps-node'


/**
 * ES6 singleton
 */
let instance = null

export type ChildProcessName = 'NODE' | 'TOR' | 'MINER' | 'RESDEX'
export type ChildProcessStatus = 'RUNNING' | 'STARTING' | 'RESTARTING' | 'FAILED' | 'STOPPING' | 'MURDER FAILED' | 'NOT RUNNING'


const childProcessNames = ['NODE', 'MINER', 'TOR', 'RESDEX']

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

      childProcessNames.forEach(processName => {
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
	 * @memberof OSService
	 */
	getAppDataPath() {
    const validApp = process.type === 'renderer' ? remote.app : app
    return path.join(validApp.getPath('appData'), 'ResistanceWallet')
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
      default:
        walkUpPath = '/../../../../..'
        break
    }

    log.info(validApp.getAppPath())

    return path.join(validApp.getAppPath(), walkUpPath)
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

}
