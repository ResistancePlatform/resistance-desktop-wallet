// @flow
import { AppAction } from '../appAction'

export type DaemonStatus = 'RUNNING' | 'NOT_RUNNING' | 'UNABLE_TO_ASCERTAIN'

export type DaemonInfo = {
  status?: DaemonStatus,
  residentSizeMB?: number
}

export type BlockChainInfo = {
  connectionCount: number,
  blockchainSynchronizedPercentage: number,
  lastBlockDate: Date | null
}

export type SystemInfoState = {
  daemonInfo?: DaemonInfo,
  blockChainInfo?: BlockChainInfo
}

const systemInfoActionTypePrefix = 'SYSTEM_INFO_ACTION'

export const SystemInfoActions = {
  EMPTY: `${systemInfoActionTypePrefix}: EMPTY`,

  START_GETTING_DAEMON_INFO: `${systemInfoActionTypePrefix}: START_GETTING_DAEMON_INFO`,
  GOT_DAEMON_INFO: `${systemInfoActionTypePrefix}: GOT_DAEMON_INFO`,

  START_GETTING_BLOCKCHAIN_INFO: `${systemInfoActionTypePrefix}: START_GETTING_BLOCKCHAIN_INFO`,
  GOT_BLOCKCHAIN_INFO: `${systemInfoActionTypePrefix}: GOT_BLOCKCHAIN_INFO`,

  startGettingDaemonInfo: (): AppAction => ({ type: SystemInfoActions.START_GETTING_DAEMON_INFO }),
  gotDaemonInfo: (daemonInfo: DaemonInfo): AppAction => ({ type: SystemInfoActions.GOT_DAEMON_INFO, payload: daemonInfo }),

  startGettingBlockChainInfo: (): AppAction => ({ type: SystemInfoActions.START_GETTING_BLOCKCHAIN_INFO }),
  gotBlockChainInfo: (blockChainInfo: BlockChainInfo): AppAction => ({ type: SystemInfoActions.GOT_BLOCKCHAIN_INFO, payload: blockChainInfo }),

  empty: (): AppAction => ({ type: SystemInfoActions.EMPTY })
}

const initState: SystemInfoState = {
  daemonInfo: {
    status: `NOT_RUNNING`,
    residentSizeMB: 0
  },
  blockChainInfo: {
    connectionCount: 0,
    blockchainSynchronizedPercentage: 0,
    lastBlockDate: null
  }
}

export const SystemInfoReducer = (state: SystemInfoState = initState, action: AppAction) => {

  switch (action.type) {
    case SystemInfoActions.GOT_DAEMON_INFO:
      return { ...state, daemonInfo: action.payload }

    case SystemInfoActions.GOT_BLOCKCHAIN_INFO:
      return { ...state, blockChainInfo: action.payload }

    default:
      return state
  }
}