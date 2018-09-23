// @flow
import { remote } from 'electron'

import { OSService } from './os-service'
import { SystemInfoActions } from '../reducers/system-info/system-info.reducer'

/**
 * ES6 singleton
 */
let instance = null

const osService = new OSService()

const minerCommandExtraArgs = ['--no-stratum', '--no-getwork']

/**
 * @export
 * @class MinerService
 */
export class MinerService {
	/**
	 * Creates an instance of MinerService.
	 * @memberof MinerService
	 */
	constructor() {
		if (!instance) { instance = this }

		return instance
	}

	/**
	 * @memberof MinerService
	 */
	start() {
    const nodeConfig = remote.getGlobal('resistanceNodeConfig')
    const args = minerCommandExtraArgs.slice()

    // Local node address
    args.unshift('-o', `http://127.0.0.1:${nodeConfig.rpcport}`)

    // RPC credentials
    args.push(`--user=${nodeConfig.rpcuser}`, `--pass=${nodeConfig.rpcpassword}`)

    if (osService.getOS() === 'windows') {
      args.push('--background')
    }

    osService.execProcess('MINER', args, this.handleStdout)
	}

	/**
	 * @memberof MinerService
	 */
	stop() {
    osService.killProcess('MINER')
	}

  handleStdout(data: Buffer) {
    const regex = /^.* accepted: \d+\/(\d+) \(100.00%\), (\d+\.\d+) khash\/s \(yay!!!\)$/m
    const matchResult = data.toString().match(regex)

    if (matchResult) {
      const hashPower = parseFloat(matchResult[2])
      const blocksNumber = parseInt(matchResult[1], 10)
      osService.dispatchAction(SystemInfoActions.updateMinerInfo(hashPower, blocksNumber))
    }
  }

}
