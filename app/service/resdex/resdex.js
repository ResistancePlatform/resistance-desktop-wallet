// @flow
import path from 'path'

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

const os = new OSService()

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
  start() {
    const homePath = os.getAppDataPath()

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
      userhome: homePath + path.sep,
      passphrase: passPhrase,
      coins: currenciesWithoutElectrum,
    }

    os.execProcess('RESDEX', [JSON.stringify(options)], this::handleStdout)
	}

	/**
   * Stops ResDEX
   *
	 * @memberof ResDexService
	 */
	stop() {
    os.killProcess('RESDEX')
	}

}

function handleStdout(data: Buffer) {
  return data.toString().includes(`API enabled at unixtime`)
}
