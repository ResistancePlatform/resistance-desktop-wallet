// @flow
import { createActions, handleActions } from 'redux-actions'
import { defaultAppState } from '../default-app-state'

export type DaemonInfo = { [string]: any }

export type BlockchainInfo = {
	connectionCount: number,
	blockchainSynchronizedPercentage: number,
	lastBlockDate: Date | null
}

export type SystemInfoState = {
	daemonInfo?: DaemonInfo,
  blockchainInfo?: BlockchainInfo,
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
    GOT_BLOCKCHAIN_INFO: (blockchainInfo: BlockchainInfo) => ({ blockchainInfo }),
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
      ...state, blockchainInfo: action.payload.blockchainInfo
    }),
    [SystemInfoActions.updateMinerInfo]: (state, action) => ({
      ...state, miner: action.payload
    })
  }, defaultAppState)
