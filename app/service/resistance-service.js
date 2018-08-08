// @flow
import { EOL } from 'os'
import * as fs from 'fs';
import path from 'path'

import { app } from 'electron'

import { OSService } from './os-service'

const generator = require('generate-password');
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


const resistancedArgs = ['-showmetrics']
const torSwitch = '-proxy=127.0.0.1:9050'

/**
 * @export
 * @class ResistanceService
 */
export class ResistanceService {
	/**
	 * Creates an instance of ResistanceService.
	 * @memberof ResistanceService
	 */
	constructor() {
		if (!instance) { instance = this }

		return instance
	}

	/**
   * Checks if Resistance node config is present and creates one if it doesn't.
   *
	 * @memberof ResistanceService
	 * @returns {Object} Node configuration dictionary
	 */
  checkAndCreateConfig(): Object {
    const configFolder = path.join(app.getPath('appData'), configFolderName)
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
    const args = isTorEnabled ? resistancedArgs.concat([torSwitch]) : resistancedArgs
    osService.execProcess('NODE', args)
	}

	/**
   * Stops resistanced
   *
	 * @memberof ResistanceService
	 */
	stop() {
    const errorHandler = () => { }
    osService.killProcess('NODE', errorHandler)
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
