// @flow
import { EOL } from 'os'
import * as fs from 'fs'
import path from 'path'
import log from 'electron-log'
import { app, dialog, remote } from 'electron'
import rimraf from 'rimraf'

import { translate } from '../i18next.config'
import { getOS } from '../utils/os'


const generator = require('generate-password')
const PropertiesReader = require('properties-reader')

const t = translate('service')

/**
 * ES6 singleton
 */
let instance = null

const configFolderName = 'Resistance'
const configFileName = 'resistance.conf'
const configFileContents = [
  // Uncomment for testnet
  // `testnet=1`,
  `txindex=1`,
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

      if (Number(resistanceNodeConfig.txindex) !== 1) {
        log.info(`Adding txindex option to the config and removing old node data.`);
        this.removeOldData()
        log.info(`Old data removed.`);
        resistanceNodeConfig = this.createConfig(configPath, resistanceNodeConfig.rpcpassword)
      }

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
  createConfig(configFilePath: string, forcePassword?: string): Object {
    const rpcPassword = forcePassword !== undefined
      ? forcePassword
      : generator.generate({
        length: 32,
        numbers: true
      })
    const contentsWithPassword = configFileContents.replace('%generatedPassword%', rpcPassword)
    fs.writeFileSync(configFilePath, contentsWithPassword)
    return PropertiesReader().read(contentsWithPassword).path()
  }

	/**
   * Removes old Resistance node data
   *
	 * @memberof ResistanceService
	 */
  removeOldData() {
    const dataPath = this.getDataPath()
    const datFilesToRemove = ['peers.dat', 'fee_estimates.dat']

    const options = {
      unlinkSync: p => {
        const { dir, base } = path.parse(p)
        log.debug(`Removing a file`, p)

        const lowerBase = base.toLowerCase()

        if (dir === dataPath) {
          if (lowerBase.endsWith('.dat') && !datFilesToRemove.includes(lowerBase)) {
            return
          }

          if (base === configFileName) {
            return
          }
        }

        return fs.unlinkSync(p)
      }
    }

    try {
      rimraf.sync(dataPath, options)
    } catch (err) {
      if (err.code === 'ENOTEMPTY' && err.path === dataPath) {
        log.debug(`Catching expected root dir error`)
        return
      }

      log.error(`Error removing old Resistance data files`, err)

      app.on('ready', async () => {
        await dialog.showMessageBox({
          type: 'error',
          title: t(`Error`),
          message: t(`An error occurred while removing old Resistance data files, make sure Resistance is not running!`),
        })
        app.quit()
      })
    }
  }
}
