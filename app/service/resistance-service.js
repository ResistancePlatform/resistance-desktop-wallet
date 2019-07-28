// @flow
import { EOL } from 'os'
import * as fs from 'fs'
import path from 'path'
import log from 'electron-log'
import generator from 'generate-password'
import PropertiesReader from 'properties-reader'
import config from 'electron-settings'
import { app, remote } from 'electron'

import { getClientInstance } from '~/service/rpc-service'
import { getStore } from '~/store/configureStore'
import { getOS, getExportDir, verifyDirectoryExistence } from '~/utils/os'
import { ChildProcessService } from './child-process-service'

const childProcess = new ChildProcessService()


/**
 * ES6 singleton
 */
let instance = null

// Uncomment for testnet
// const walletFolderName = 'testnet3'

const walletFolderName = ''
const configFolderName = 'Resistance'
const configFileName = 'resistance.conf'
const configFileContents = [
  // Uncomment for testnet
  // `testnet=1`,
  `rpcuser=resuser`,
  `rpcpassword=%generatedPassword%`,
  ``
].join(EOL)

const resistancedArgs = ['-printtoconsole', '-rpcthreads=8', '-server']
const torSwitch = '-proxy=127.0.0.1:9050'


/**
 * @export
 * @class ResistanceService
 */
export class ResistanceService {
  isDoneLoading: boolean

	/**
	 * Creates an instance of ResistanceService.
   *
	 * @memberof ResistanceService
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

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
    const configPath = path.join(configFolder, configFileName)

    if (!fs.existsSync(configFolder)) {
      fs.mkdirSync(configFolder)
    }

    let resistanceNodeConfig

    if (fs.existsSync(configPath)) {
      resistanceNodeConfig = PropertiesReader(configPath).path()
      log.info(`The Resistance config file ${configPath} exists and does not need to be created.`)
    } else {
      resistanceNodeConfig = this.createConfig(configPath)
      log.info(`The Resistance config file ${configPath} was successfully created.`)
    }

    if (!resistanceNodeConfig.rpcport) {
      resistanceNodeConfig.rpcport = resistanceNodeConfig.testnet ? 18132 : 8132
    }

    resistanceNodeConfig.configPath = configPath

    return resistanceNodeConfig
  }

	/**
   * Starts resistanced
   *
   * @param {boolean} isTorEnabled
	 * @memberof ResistanceService
	 */
	async start(isTorEnabled: boolean, isEtomic: boolean = false) {
    await this::startOrRestart({isTorEnabled, isEtomic, start: true})
	}

	/**
   * Restarts resistanced
   *
   * @param {boolean} isTorEnabled
	 * @memberof ResistanceService
	 */
	async restart(isTorEnabled: boolean) {
    await this::startOrRestart({isTorEnabled, isEtomic: false, start: false})
	}

	/**
   * Stops resistanced
   *
	 * @memberof ResistanceService
	 */
	async stop(isEtomic: boolean) {
    const client = getClientInstance(isEtomic)
    return client.stop()
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

}

/* Resistance Service private methods */

/**
 * Private method. Starts or restarts the local node process based on the start switch
 *
 * @param {boolean} isTorEnabled
 * @param {boolean} start Starts if true, restarts otherwise
 * @memberof ResistanceService
 */
async function startOrRestart({isTorEnabled, start, isEtomic}) {
  let args
  const caller = start ? childProcess.startProcess : childProcess.restartProcess

  if (isEtomic) {
    args = ['-ac_name=ETOMIC', '-printtoconsole']
  } else {
    args = isTorEnabled ? resistancedArgs.concat([torSwitch]) : resistancedArgs.slice()
    // TODO: support system wide wallet paths, stored in config.get('wallet.path')
    // https://github.com/ResistancePlatform/resistance-core/issues/84

    const walletName = config.get('wallet.name', 'wallet')
    args.push(`-wallet=${walletName}.dat`)

    const miningAddress = config.get('miningAddress', false)

    if (miningAddress) {
      args.push(`-mineraddress=${miningAddress}`)
    }

    const exportDir = getExportDir()

    log.info(`Export Dir: ${exportDir}`)

    try {
      await verifyDirectoryExistence(exportDir)
    } catch (err) {
      log.error(`Can't create local node export directory`, err)
      const actions = childProcess.getSettingsActions()
      getStore().dispatch(actions.childProcessFailed(isEtomic ? 'NODE_ETOMIC' : 'NODE', err.message))
      return
    }

    args.push(`-exportdir=${exportDir}`)

  }

  this.isDoneLoading = false

  await caller.bind(childProcess)({
    processName: isEtomic ? 'NODE_ETOMIC' : 'NODE',
    args,
    shutdownFunction: async () => this.stop(isEtomic),
    outputHandler: this::handleOutput,
    waitUntilReady: childProcess.createReadinessWaiter(this::getRpcAvailabilityChecker(isEtomic))
  })
}

/**
 * Private method. Called on new data in stdout, returns true if Resistance node has been initialized.
 *
 * @param {string} configFilePath
 * @memberof ResistanceService
 */
function handleOutput(data: Buffer) {
  if (!this.isDoneLoading) {
    this.isDoneLoading = data.toString().includes(`init message: Done loading`)
  }
}

function getRpcAvailabilityChecker(isEtomic: boolean) {
  const checker = async () => {
    const client = getClientInstance(isEtomic)

    if (!this.isDoneLoading) {
      return false
    }

    try {
      await client.getInfo()
      log.debug(`The local node ${isEtomic ? '(etomic) ' : ''}has successfully accepted an RPC call`)
      return true
    } catch (err) {
      log.debug(`The local node hasn't accepted an RPC check call`)
      return false
    }
  }

  return checker
}
