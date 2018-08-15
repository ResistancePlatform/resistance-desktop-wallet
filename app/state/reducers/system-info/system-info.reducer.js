// @flow
import { createActions, handleActions } from 'redux-actions'
import { defaultAppState } from '../default-app-state'

export type DaemonStatus = 'RUNNING' | 'NOT_RUNNING' | 'UNABLE_TO_ASCERTAIN'

export type DaemonInfo = {
	status?: DaemonStatus,
  residentSizeMB?: number,
  getInfoResult: Object
}

export type BlockChainInfo = {
	connectionCount: number,
	blockchainSynchronizedPercentage: number,
	lastBlockDate: Date | null
}

export type SystemInfoState = {
	daemonInfo?: DaemonInfo,
  blockChainInfo?: BlockChainInfo,
  miner: {
    hashingPower: float,
    minedBlocksNumber: number
  }
}

export const SystemInfoActions = createActions(
  {
    EMPTY: undefined,

    START_GETTING_DAEMON_INFO: undefined,
    GOT_DAEMON_INFO: (daemonInfo: DaemonInfo) => ({ daemonInfo }),

    START_GETTING_BLOCKCHAIN_INFO: undefined,
    GOT_BLOCKCHAIN_INFO: (blockChainInfo: BlockChainInfo) => ({ blockChainInfo }),

    OPEN_WALLET_IN_FILE_MANAGER: undefined,
    OPEN_INSTALLATION_FOLDER: undefined,

    UPDATE_MINER_INFO: (hashingPower, minedBlocksNumber) => ({ hashingPower, minedBlocksNumber })
  },
  {
    prefix: 'APP/SYSTEM_INFO'
  }
)

export const SystemInfoReducer = handleActions(
  {
    [SystemInfoActions.gotDaemonInfo]: (state, action) => ({
      ...state, daemonInfo: action.payload.daemonInfo
    }),
    [SystemInfoActions.gotBlockchainInfo]: (state, action) => ({
      ...state, blockChainInfo: action.payload.blockChainInfo
    }),
    [SystemInfoActions.updateMinerInfo]: (state, action) => ({
      ...state, miner: action.payload
    })
  }, defaultAppState)
