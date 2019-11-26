// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type DaemonInfo = { [string]: any }

export type Operation = { [string]: any }

export type BlockchainInfo = {
	connectionCount: number,
  synchronizedPercentage: number,
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
  isNewOperationTriggered: boolean,
  isOperationsModalOpen: boolean,
  updateModal: {
    versionName: string | null,
    downloadUrl: string | null,
    isVisible: boolean | false
  }
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

    NEW_OPERATION_TRIGGERED: undefined,
    GET_OPERATIONS: undefined,
    GOT_OPERATIONS: (operations: Operation[]) => ({ operations }),
    GET_OPERATIONS_FAILURE:  (errorMessage: string, code) => ({ errorMessage, code }),
    OPERATION_FINISHED: (operation) => ({ operation }),

    OPEN_WALLET_IN_FILE_MANAGER: undefined,
    OPEN_INSTALLATION_FOLDER: undefined,

    UPDATE_MINER_INFO: (hashingPower, minedBlocksNumber) => ({ hashingPower, minedBlocksNumber }),

    OPEN_OPERATIONS_MODAL: undefined,
    CLOSE_OPERATIONS_MODAL: undefined,

    OPEN_UPDATE_MODAL: (name: string, url: string) => ({ name, url }),
    CLOSE_UPDATE_MODAL: undefined,

    CHECK_WALLET_UPDATE: undefined,
    CHECK_WALLET_UPDATE_SUCCEEDED: undefined,
    CHECK_WALLET_UPDATE_FAILED: undefined,
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

    [SystemInfoActions.newOperationTriggered]: state => ({
      ...state, isNewOperationTriggered: true
    }),
    [SystemInfoActions.gotOperations]: (state, action) => ({
      ...state, operations: action.payload.operations, isNewOperationTriggered: false
    }),
    [SystemInfoActions.getOperationsFailure]: state => ({
      ...state, isNewOperationTriggered: false
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
    }),

    // Update Modal
    [SystemInfoActions.openUpdateModal]: (state, action) => ({
      ...state,
      updateModal: {
        ...state.updateModal,
        isVisible: true,
        versionName: action.payload.name,
        downloadUrl: action.payload.url
      }
    }),
    [SystemInfoActions.closeUpdateModal]: state => ({
      ...state,
      updateModal: {
        ...state.updateModal,
        isVisible: false,
      }
    })

  }, preloadedState)
