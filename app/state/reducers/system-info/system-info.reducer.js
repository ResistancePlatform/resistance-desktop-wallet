// @flow
import { createActions, handleActions } from 'redux-actions'
import { defaultAppState } from '../default-app-state'

export type DaemonInfo = { [string]: any }

export type Operation = { [string]: any }

export type BlockchainInfo = {
	connectionCount: number,
	blockchainSynchronizedPercentage: number,
	lastBlockDate: Date | null
}

export type SystemInfoState = {
	daemonInfo?: DaemonInfo,
  blockchainInfo?: BlockchainInfo,
  operations: Operation[],
  miner: {
    hashingPower: float,
    minedBlocksNumber: number
  },
  isOperationsModalOpen: boolean
}

export const SystemInfoActions = createActions(
  {
    EMPTY: undefined,

    GET_DAEMON_INFO: undefined,
    GOT_DAEMON_INFO: (daemonInfo: DaemonInfo) => ({ daemonInfo }),
    GET_DAEMON_INFO_FAILURE:  (errorMessage: string, code) => ({ errorMessage, code }),

    GET_BLOCKCHAIN_INFO: undefined,
    GOT_BLOCKCHAIN_INFO: (blockchainInfo: BlockchainInfo) => ({ blockchainInfo }),
    GET_BLOCKCHAIN_INFO_FAILURE:  (errorMessage: string, code) => ({ errorMessage, code }),

    GET_OPERATIONS: undefined,
    GOT_OPERATIONS: (operations: Operation[]) => ({ operations }),
    GET_OPERATIONS_FAILURE:  (errorMessage: string, code) => ({ errorMessage, code }),

    OPEN_WALLET_IN_FILE_MANAGER: undefined,
    OPEN_INSTALLATION_FOLDER: undefined,

    UPDATE_MINER_INFO: (hashingPower, minedBlocksNumber) => ({ hashingPower, minedBlocksNumber }),

    OPEN_OPERATIONS_MODAL: undefined,
    CLOSE_OPERATIONS_MODAL: undefined
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
    [SystemInfoActions.gotOperations]: (state, action) => ({
      ...state, operations: action.payload.operations
    }),

    [SystemInfoActions.updateMinerInfo]: (state, action) => ({
      ...state, miner: action.payload
    }),

    // Operations Modal
    [SystemInfoActions.openOperationsModal]: state => ({
      ...state, isOperationsModalOpen: true
    }),
    [SystemInfoActions.closeOperationsModal]: state => ({
      ...state, isOperationsModalOpen: false
    })

  }, defaultAppState)
