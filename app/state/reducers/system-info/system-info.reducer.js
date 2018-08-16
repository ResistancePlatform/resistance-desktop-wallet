// @flow
import { createActions, handleActions } from 'redux-actions'
import { defaultAppState } from '../default-app-state'

export type DaemonInfo = { [string]: any }

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

    GET_DAEMON_INFO: undefined,
    GOT_DAEMON_INFO: (daemonInfo: DaemonInfo) => ({ daemonInfo }),
    GET_DAEMON_INFO_FAILURE:  (errorMessage: string) => ({ errorMessage }),

    GET_BLOCKCHAIN_INFO: undefined,
    GOT_BLOCKCHAIN_INFO: (blockChainInfo: BlockChainInfo) => ({ blockChainInfo }),
    GET_BLOCKCHAIN_INFO_FAILURE:  (errorMessage: string) => ({ errorMessage }),

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
