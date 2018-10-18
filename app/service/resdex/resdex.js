// @flow
import os from 'os'
import path from 'path'
import log from 'electron-log'

import { OSService } from '../os-service'
import { supportedCurrencies } from '~/constants/resdex/supported-currencies'

const rpcPort = 17445
const seedNodeAddress = '35.174.118.206'
// TODO: provide the one decrypted with the password
const passPhrase = 'treat board tree once reduce reduce expose coil guilt fish flat boil'


/**
 * ES6 singleton
 */
let instance = null

const osService = new OSService()

/**
 * @export
 * @class ResDexService
 */
export class ResDexService {
	/**
	 * Creates an instance of ResDexService.
   *
	 * @memberof ResDexService
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

		return instance
	}

	/**
   * Starts ResDEX
   *
	 * @memberof ResDexService
	 */
  start(seedPhrase) {
    const currenciesWithoutElectrum = supportedCurrencies.map(currency => {
      const result = {...currency}
      delete result.electrumServers
      return result
    })

    const options = {
      gui: 'resdex',
      client: 1,
      rpcport: rpcPort,
      canbind: 0,
      seednode: seedNodeAddress,
      userhome: os.homedir(),
      passphrase: seedPhrase || passPhrase,
      coins: currenciesWithoutElectrum,
    }

    const resDexDir = path.join(osService.getAppDataPath(), 'ResDEX')

    osService.verifyDirectoryExistence(resDexDir).then(() => (
      osService.execProcess('RESDEX', [JSON.stringify(options)], this::handleStdout, { cwd: resDexDir })
    )).catch(err => {
      const actions = osService.getSettingsActions()
      osService.dispatchAction(actions.childProcessFailed('RESDEX', err.toString()))
    })

	}

	/**
   * Stops ResDEX
   *
	 * @memberof ResDexService
	 */
	stop() {
    osService.killProcess('RESDEX')
	}

}

function handleStdout(data: Buffer) {
  // API enabled at unixtime
  return data.toString().includes(`ResDEX Marketmaker`)
}
