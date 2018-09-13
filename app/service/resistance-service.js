// @flow
import { EOL } from 'os'
import * as fs from 'fs';
import path from 'path'
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
    return path.join(validApp.getPath('appData'), configFolderName)
  }

  getWalletPath() {
    return path.join(this.getDataPath(), walletFolderName)
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
    } else {
      resistanceNodeConfig = this.createConfig(configFile)
      console.log(`Resistance config has been successfully created.`)
    }

    return resistanceNodeConfig
  }

	/**
   * Starts resistanced
   *
	 * @memberof ResistanceService
	 */
	start(isTorEnabled: boolean) {
    const args = isTorEnabled ? resistancedArgs.concat([torSwitch]) : resistancedArgs.slice()

    // TODO: support system wide wallet paths, stored in config.get('wallet.path')
    // https://github.com/ResistancePlatform/resistance-core/issues/84

    const walletName = config.get('wallet.name', 'wallet')
    args.push(`-wallet=${walletName}.dat`)

    this::verifyExportDirExistence().then(exportDir => {
      args.push(`-exportdir=${exportDir}`)
      osService.execProcess('NODE', args, this::handleStdout)
      return Promise.resolve()
    }).catch(err => {
      const actions = osService.getSettingsActions()
      osService.dispatchAction(actions.childProcessFailed('NODE', err.toString()))
    })

	}

	/**
   * Restarts resistanced
   *
	 * @memberof ResistanceService
	 */
	restart(isTorEnabled: boolean) {
    const args = isTorEnabled ? resistancedArgs.concat([torSwitch]) : resistancedArgs.slice()
    osService.restartProcess('NODE', args)
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
 * Private method. Called on new data in stdout, returns true if Resistance node has been initialized.
 *
 * @param {string} configFilePath
 * @memberof ResistanceService
 */
function handleStdout(data: Buffer) {
  return data.toString().includes(`READY for RPC calls`)
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
