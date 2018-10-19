// @flow
import { EOL } from 'os'
import * as fs from 'fs'
import path from 'path'
import log from 'electron-log'
import generator from 'generate-password'
import PropertiesReader from 'properties-reader'
import config from 'electron-settings'
import { app, remote, net } from 'electron'

import { getStore } from '~/store/configureStore'
import { getOS, getAppDataPath, verifyDirectoryExistence } from '~/utils/os'
import { ChildProcessService } from './child-process-service'

const childProcess = new ChildProcessService()


/**
 * ES6 singleton
 */
let instance = null

const walletFolderName = 'testnet3'
const configFolderName = 'Resistance'
const configFileName = 'resistance.conf'
const configFileContents = [
  `testnet=1`,
  `port=18233`,
  `rpcport=18232`,
  `rpcuser=resuser`,
  `rpcpassword=%generatedPassword%`,
  ``
].join(EOL)

const resistancedArgs = ['-printtoconsole', '-rpcthreads=8']
const torSwitch = '-proxy=127.0.0.1:9050'


/**
 * @export
 * @class ResistanceService
 */
export class ResistanceService {
	/**
	 * Creates an instance of ResistanceService.
   *
	 * @memberof ResistanceService
	 */
	constructor() {
		if (!instance) { instance = this }

		return instance
	}

	/**
	 * Returns Resistance service data path.
   *
	 * @memberof ResistanceService
	 */
  getDataPath() {
    const validApp = process.type === 'renderer' ? remote.app : app
    let configFolder = path.join(validApp.getPath('appData'), configFolderName)
    if (getOS() === 'linux') {
      configFolder = path.join(validApp.getPath('home'), '.resistance')
    }
    return configFolder
  }

	/**
   * This is for the raw wallet path i.e. the testnet3 directory
   *
	 * @memberof ResistanceService
	 * @returns {string}
	 */
  getWalletPath() {
    return path.join(this.getDataPath(), walletFolderName)
  }

  getParamsPath() {
    const validApp = process.type === 'renderer' ? remote.app : app
    let paramsPath

    if (getOS() === 'linux') {
      paramsPath  = path.join(validApp.getPath('home'), '.resistance-params')
    } else {
      paramsPath = path.join(validApp.getPath('appData'), 'ResistanceParams')
    }

    return paramsPath
  }

	/**
   * Checks if Resistance node config is present and creates one if it doesn't.
   *
	 * @memberof ResistanceService
	 * @returns {Object} Node configuration dictionary
	 */
  checkAndCreateConfig(): Object {
    const configFolder = this.getDataPath()
    const configFile = path.join(configFolder, configFileName)

    if (!fs.existsSync(configFolder)) {
      fs.mkdirSync(configFolder)
    }

    let resistanceNodeConfig

    if (fs.existsSync(configFile)) {
      resistanceNodeConfig = PropertiesReader(configFile).path()
      log.info(`The Resistance config file ${configFile} exists and does not need to be created.`)
    } else {
      resistanceNodeConfig = this.createConfig(configFile)
      log.info(`The Resistance config file ${configFile} was successfully created.`)
    }

    return resistanceNodeConfig
  }

	/**
   * Starts resistanced
   *
   * @param {boolean} isTorEnabled
	 * @memberof ResistanceService
	 */
	async start(isTorEnabled: boolean) {
    await this::startOrRestart(isTorEnabled, true)
	}

	/**
   * Restarts resistanced
   *
   * @param {boolean} isTorEnabled
	 * @memberof ResistanceService
	 */
	async restart(isTorEnabled: boolean) {
    await this::startOrRestart(isTorEnabled, false)
	}

	/**
   * Stops resistanced
   *
	 * @memberof ResistanceService
	 */
	async stop() {
    await childProcess.killProcess('NODE')
	}

	/**
   * Creates Resistance config file with a generated password.
   *
   * @param {string} configFilePath
	 * @memberof ResistanceService
	 */
  createConfig(configFilePath: string): Object {
    const rpcPassword = generator.generate({
      length: 32,
      numbers: true
    })
    const contentsWithPassword = configFileContents.replace('%generatedPassword%', rpcPassword)
    fs.writeFileSync(configFilePath, contentsWithPassword)
    return PropertiesReader().read(contentsWithPassword).path()
  }

	/**
   * Returns Resistance export dir as provided with -exportdir command line argument to the node.
   *
	 * @memberof ResistanceService
	 */
  getExportDir() {
    return path.join(getAppDataPath(), 'ExportDir')
  }

}

/* Resistance Service private methods */

/**
 * Private method. Starts or restarts the local node process based on the start switch
 *
 * @param {boolean} isTorEnabled
 * @param {boolean} start Starts if true, restarts otherwise
 * @memberof ResistanceService
 */
async function startOrRestart(isTorEnabled: boolean, start: boolean) {
  const args = isTorEnabled ? resistancedArgs.concat([torSwitch]) : resistancedArgs.slice()
  // TODO: support system wide wallet paths, stored in config.get('wallet.path')
  // https://github.com/ResistancePlatform/resistance-core/issues/84

  const walletName = config.get('wallet.name', 'wallet')
  args.push(`-wallet=${walletName}.dat`)
  const caller = start ? childProcess.execProcess : childProcess.restartProcess

  const exportDir = this.getExportDir()

  try {
    await verifyDirectoryExistence(exportDir)
  } catch (err) {
    log.error(`Can't create local node export directory`, err)
    const actions = childProcess.getSettingsActions()
    getStore().dispatch(actions.childProcessFailed('NODE', err.message))
    return
  }

  args.push(`-exportdir=${exportDir}`)

  await caller.bind(childProcess)({
    processName: 'NODE',
    args,
    outputHandler: this::handleOutput,
  })
}

/**
 * Private method. Called on new data in stdout, returns true if Resistance node has been initialized.
 *
 * @param {string} configFilePath
 * @memberof ResistanceService
 */
function handleOutput(data: Buffer) {
  return data.toString().includes(`init message: Done loading`)
}

/**
 * Returns Resistance export dir as provided with -exportdir command line argument to the node.
 *
 * @memberof ResistanceService
 */
function isReady() {
  const nodeConfig = remote.getGlobal('resistanceNodeConfig')

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const request = net.request(`http://localhost:${nodeConfig.port}`)

      request.on('response', response => {
        if (response.statusCode === 405) {
          clearInterval(interval)

          // Give it a little more time to avoid issues
          setTimeout(resolve, 500)
        }
      })
      request.on('error', () => {})
      request.end()
    }, 100)

    setTimeout(() => {
      clearInterval(interval)
      reject(new Error('Giving up trying to connect to marketmaker'))
    }, 10000)
  })
}
