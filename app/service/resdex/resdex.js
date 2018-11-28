// @flow
import log from 'electron-log'
import os from 'os'
import path from 'path'
import rp from 'request-promise-native'

import { getStore } from '~/store/configureStore'
import { getAppDataPath, verifyDirectoryExistence } from '~/utils/os'
import { ChildProcessService } from '../child-process-service'
import { supportedCurrencies } from '~/constants/resdex/supported-currencies'


const netId = 2045
const seedNodeAddress = '34.201.64.15'
// const seedNodeAddress = '35.174.118.206'

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

    const { uri, rpcPort, folderName } = getProcessSettings(processName)

    const options = {
      gui: 'resdex',
      client: 1,
      netid: netId,
      rpcport: rpcPort,
      canbind: 0,
      seednode: seedNodeAddress,
      userhome: os.homedir(),
      passphrase: getActualSeedPhrase(processName, seedPhrase),
      coins: currenciesWithoutElectrum,
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

    await childProcess.execProcess({
      processName,
      args: [JSON.stringify(options)],
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
    await childProcess.killProcess(processName)
	}

}

function checkApiAvailability(uri) {
  const checker = async () => {
    log.debug(`Querying ${uri} to check if ResDEX is ready...`)

    try {
      const response = await rp({
        uri,
        resolveWithFullResponse: true,
      })

      const result = response.statusCode === 200
      if (result) {
        log.debug(`ResDEX process on ${uri} is ready!`)
      }

      return result
    } catch (err) {
      return false
    }
  }

  return checker
}
