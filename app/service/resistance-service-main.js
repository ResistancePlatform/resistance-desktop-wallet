// @flow
import { EOL } from 'os'
import * as fs from 'fs'
import path from 'path'
import log from 'electron-log'
import { app, remote } from 'electron'

import { getOS } from '../utils/os'


const generator = require('generate-password')
const PropertiesReader = require('properties-reader')

/**
 * ES6 singleton
 */
let instance = null

const configFolderName = 'Resistance'
const configFileName = 'resistance.conf'
const configFileContents = [
  // Uncomment for testnet
  // `testnet=1`,
  `rpcuser=resuser`,
  `rpcpassword=%generatedPassword%`,
  ``
].join(EOL)


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
      log.info(`The Resistance config file ${configPath} exists and does not need to be created.`);
    } else {
      resistanceNodeConfig = this.createConfig(configPath)
      log.info(`The Resistance config file ${configPath} was successfully created.`);
    }

    if (!resistanceNodeConfig.rpcport) {
      resistanceNodeConfig.rpcport = resistanceNodeConfig.testnet ? 18132 : 8132
    }

    resistanceNodeConfig.configPath = configPath

    return resistanceNodeConfig
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
