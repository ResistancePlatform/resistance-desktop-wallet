// @flow
import { EOL } from 'os'
import * as fs from 'fs';
import path from 'path'
import log from 'electron-log'
import config from 'electron-settings'
import { app, remote } from 'electron'

import { OSService } from './os-service'

const generator = require('generate-password')
const PropertiesReader = require('properties-reader')

/**
 * ES6 singleton
 */
let instance = null

const osService = new OSService()

const walletFolderName = 'testnet3'
const configFolderName = 'Resistance'
const paramFolderName = 'ResistanceParams'
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
    if (osService.getOS() === 'linux') {
      configFolder = path.join(validApp.getPath('home'), '.resistance')
    }
    return configFolder;
  }

  //This is for the raw wallet path i.e. the testnet3 directory
  getWalletPath() {
    return path.join(this.getDataPath(), walletFolderName)
  }

  getParamsPath() {
    const validApp = process.type === 'renderer' ? remote.app : app
    let paramsPath = path.join(validApp.getPath('appData'), paramFolderName)
    if (osService.getOS() === 'linux') {
      configFolder = path.join(validApp.getPath('home'), '.resistance-params')
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
      log.info(`The Resistance config file ${configFile} and does not need to be created.`);
    } else {
      resistanceNodeConfig = this.createConfig(configFile)
      log.info(`The Resistance config file ${configFile} was successfully created.`);
    }

    return resistanceNodeConfig
  }

	/**
   * Starts resistanced
   *
   * @param {boolean} isTorEnabled
	 * @memberof ResistanceService
	 */
	start(isTorEnabled: boolean) {
    this::startOrRestart(isTorEnabled, true)
	}

	/**
   * Restarts resistanced
   *
   * @param {boolean} isTorEnabled
	 * @memberof ResistanceService
	 */
	restart(isTorEnabled: boolean) {
    this::startOrRestart(isTorEnabled, false)
	}

	/**
   * Stops resistanced
   *
	 * @memberof ResistanceService
	 */
	stop() {
    osService.killProcess('NODE')
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
    return path.join(osService.getAppDataPath(), 'ExportDir')
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
function startOrRestart(isTorEnabled: boolean, start: boolean) {
  const args = isTorEnabled ? resistancedArgs.concat([torSwitch]) : resistancedArgs.slice()
  // TODO: support system wide wallet paths, stored in config.get('wallet.path')
  // https://github.com/ResistancePlatform/resistance-core/issues/84

  const walletName = config.get('wallet.name', 'wallet')
  args.push(`-wallet=${walletName}.dat`)
  const caller = start ? osService.execProcess : osService.restartProcess

  this::verifyExportDirExistence().then(exportDir => {
    args.push(`-exportdir=${exportDir}`)
    caller.bind(osService)('NODE', args, this::handleStdout)
    return Promise.resolve()
  }).catch(err => {
    const actions = osService.getSettingsActions()
    osService.dispatchAction(actions.childProcessFailed('NODE', err.toString()))
  })
}

/**
 * Private method. Called on new data in stdout, returns true if Resistance node has been initialized.
 *
 * @param {string} configFilePath
 * @memberof ResistanceService
 */
function handleStdout(data: Buffer) {
  return data.toString().includes(`init message: Done loading`)
}

/**
 * Privte method. Checks if local node export directory exists, otherwise creates one.
 *
 * @returns {Promise}
 * @memberof ResistanceService
 */
function verifyExportDirExistence() {
  const exportDir = this.getExportDir()

  const promise = new Promise((resolve, reject) => {
    fs.access(exportDir, err => {
      if (err) {
        fs.mkdir(exportDir, mkdirError => mkdirError ? reject(mkdirError) : resolve(exportDir))
      }
      resolve(exportDir)
    })
  })

  return promise
}
