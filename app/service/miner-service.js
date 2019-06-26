// @flow
import { remote } from 'electron'

import { getStore } from '~/store/configureStore'
import { ChildProcessService } from './child-process-service'
import { SystemInfoActions } from '../reducers/system-info/system-info.reducer'

/**
 * ES6 singleton
 */
let instance = null

const childProcess = new ChildProcessService()

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
	async start(threadsNumber?: number) {
    const nodeConfig = remote.getGlobal('resistanceNodeConfig')
    const args = minerCommandExtraArgs.slice()

    // Local node address
    args.unshift('-o', `http://127.0.0.1:${nodeConfig.rpcport}`)

    // RPC credentials
    args.push(`--user=${nodeConfig.rpcuser}`, `--pass=${nodeConfig.rpcpassword}`)

    if (threadsNumber) {
      args.push(`--threads=${threadsNumber}`)
    }

    // Mining address
    // args.push(`--coinbase-addr=rpTFwK6gPqkXJA7CvJff2jXpgtdd3GJuB5C`)

    await childProcess.startProcess({processName: 'MINER', args, outputHandler: this.handleOutput})
	}

	/**
	 * @memberof MinerService
	 */
	async stop() {
    await childProcess.killProcess('MINER')
	}

  handleOutput(data: Buffer) {
    const regex = /^.* accepted: \d+\/(\d+) \(100.00%\), (\d+\.\d+) khash\/s \(yay!!!\)$/m
    const matchResult = data.toString().match(regex)

    if (matchResult) {
      const hashPower = parseFloat(matchResult[2])
      const blocksNumber = parseInt(matchResult[1], 10)
      getStore().dispatch(SystemInfoActions.updateMinerInfo(hashPower, blocksNumber))
    }
  }

}
