// @flow
import log from 'electron-log'
import os from 'os'
import path from 'path'
import { remote } from 'electron'

import { getStore } from '~/store/configureStore'
import { getAppDataPath, verifyDirectoryExistence } from '~/utils/os'
import { ChildProcessService } from '../child-process-service'
import { supportedCurrencies } from '~/constants/resdex/supported-currencies'

const netId = 2045
const rpcPort = 17445
const seedNodeAddress = '35.174.118.206'


/**
 * ES6 singleton
 */
let instance = null

const childProcess = new ChildProcessService()

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
  async start(seedPhrase) {
    const currenciesWithoutElectrum = supportedCurrencies.map(currency => {
      const result = {...currency}
      delete result.electrumServers
      return result
    })

    const options = {
      gui: 'resdex',
      client: 1,
      netid: netId,
      rpcport: rpcPort,
      canbind: 0,
      seednode: seedNodeAddress,
      userhome: os.homedir(),
      passphrase: seedPhrase || remote.getGlobal('resDex').seedPhrase,
      coins: currenciesWithoutElectrum,
    }

    const resDexDir = path.join(getAppDataPath(), 'ResDEX')

    try {
      await verifyDirectoryExistence(resDexDir)
    } catch(err) {
      log.error(`Can't create ResDEX directory`, err)
      const actions = childProcess.getSettingsActions()
      getStore().dispatch(actions.childProcessFailed('RESDEX', err.message))
      return
    }

    await childProcess.execProcess({
      processName: 'RESDEX',
      args: [JSON.stringify(options)],
      outputHandler: this::handleOutput,
      spawnOptions: { cwd: resDexDir }
    })

	}

	/**
   * Stops ResDEX
   *
	 * @memberof ResDexService
	 */
	async stop() {
    await childProcess.killProcess('RESDEX')
	}

}

function handleOutput(data: Buffer) {
  // API enabled at unixtime
  return data.toString().includes(`ResDEX Marketmaker`)
}
