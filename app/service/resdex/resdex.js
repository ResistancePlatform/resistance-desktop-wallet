// @flow
import log from 'electron-log'
import os from 'os'
import path from 'path'
import rp from 'request-promise-native'

import { resDexApiFactory } from '~/service/resdex/api'
import { getStore } from '~/store/configureStore'
import { getOS, getAppDataPath, verifyDirectoryExistence } from '~/utils/os'
import { ChildProcessService } from '../child-process-service'
import { supportedCurrencies } from '~/constants/resdex/supported-currencies'


const netId = 1234 //2045
const seedNodeAddress = '54.226.203.173'

const processSettings = {
  RESDEX: {
    folderName: 'Main',
    rpcPort: 17445,
  },
  RESDEX_PRIVACY1: {
    folderName: 'Privacy 1',
    rpcPort: 27445,
  },
  RESDEX_PRIVACY2: {
    folderName: 'Privacy 2',
    rpcPort: 37445,
  }
}

/* Privacy 1 and Privacy 2 processes use mangled seeds generated here.
*/
export function getActualSeedPhrase(processName: string, seedPhrase: string) {
  let actualSeedPhrase = seedPhrase

  // Private ResDEX processes use a mangled but unique seed phrase
  if (processName !== 'RESDEX') {
    actualSeedPhrase = `${seedPhrase} ${processName}`
  }

  return actualSeedPhrase
}

export function getProcessSettings(processName: string): object {
  const { folderName, rpcPort } = processSettings[processName]
  return {
    processName,
    folderName,
    rpcPort,
    uri:  `http://127.0.0.1:${rpcPort}`,
  }
}

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
  async start(processName: string, seedPhrase) {
    const currenciesWithoutElectrum = supportedCurrencies.map(currency => {
      const result = {...currency}
      delete result.electrumServers
      return result
    })

    const userhome = getOS() === 'windows'
      ? path.join(os.homedir(), 'AppData', 'Roaming')
      : os.homedir()

    const { uri, rpcPort, folderName } = getProcessSettings(processName)

    const options = {
      gui: 'resdex',
      //client: 1,
      netid: netId,
      rpcport: rpcPort,
      //canbind: 0,
      seednodes: [seedNodeAddress],
      userhome: userhome,
      passphrase: getActualSeedPhrase(processName, seedPhrase),
      coins: [{"coin": "RES","rpcport": 18132,"confpath": "/Users/luke/Library/Application Support/Resistance/resistance.conf","mm2": 1},{"coin": "ETH","name": "ethereum","fname": "Ethereum","etomic": "0x0000000000000000000000000000000000000000","rpcport": 80}]
    }

    if (processName !== 'RESDEX') {
      options.privacy = processName === 'RESDEX_PRIVACY1' ? '1' : '2'
    }

    const resDexParentDir = path.join(getAppDataPath(), 'ResDEX')
    const resDexDir = path.join(resDexParentDir, folderName)

    try {
      await verifyDirectoryExistence(resDexParentDir)
      await verifyDirectoryExistence(resDexDir)
    } catch(err) {
      log.error(`Can't create ResDEX directory`, err)
      const actions = childProcess.getSettingsActions()
      getStore().dispatch(actions.childProcessFailed(processName, err.message))
      return
    }

    await childProcess.startProcess({
      processName,
      args: [JSON.stringify(options)],
      shutdownFunction: async () => this.stop(processName),
      waitUntilReady: childProcess.createReadinessWaiter(this::checkApiAvailability(uri)),
      spawnOptions: { cwd: resDexDir }
    })

	}

	/**
   * Stops ResDEX
   *
	 * @memberof ResDexService
	 */
	async stop(processName: string) {
    const api = resDexApiFactory(processName)
    return api.stop()
	}

}

function checkApiAvailability(uri) {
  const checker = async () => {
    log.debug(`Querying ${uri} to check if ResDEX is ready...`)
//curl --url "http://127.0.0.1:15948" --data "{\"userpass\":\"$userpass\",\"method\":\"my_balance\",\"coin\":\"ETH\"}"
    try {
      const response = await rp({
        method: 'POST',
        uri,
        body: {
        },
        json: true, // Automatically stringifies the body to JSON
        resolveWithFullResponse: true,
      })

      log.debug(`${JSON.stringify(response)}`)

      const result = response.statusCode === 500
      if (result) {
        log.debug(`ResDEX process on ${uri} is ready!`)
      }

      return result
    } catch (err) {
      log.debug(`${JSON.stringify(err)}`)
      const result = err.statusCode === 500
      if (result) {
        log.debug(`ResDEX process on ${uri} is ready!`)
        return true
      }
      return false
    }
  }

  return checker
}
