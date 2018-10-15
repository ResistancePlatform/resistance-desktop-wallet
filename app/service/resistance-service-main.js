// @flow
import { EOL } from 'os'
import * as fs from 'fs'
import path from 'path'
import log from 'electron-log'
import { app, remote } from 'electron'

import { OSService } from './os-service-main'

const generator = require('generate-password')
const PropertiesReader = require('properties-reader')

/**
 * ES6 singleton
 */
let instance = null

const osService = new OSService()

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
    const configFile = path.join(configFolder, configFileName)

    if (!fs.existsSync(configFolder)) {
      fs.mkdirSync(configFolder)
    }

    let resistanceNodeConfig

    if (fs.existsSync(configFile)) {
      resistanceNodeConfig = PropertiesReader(configFile).path()
      log.info(`The Resistance config file ${configFile} exists and does not need to be created.`);
    } else {
      resistanceNodeConfig = this.createConfig(configFile)
      log.info(`The Resistance config file ${configFile} was successfully created.`);
    }

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
