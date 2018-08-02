// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedAppState } from '../appState'

export type SettingsState = {
	isDaemonUpdating: boolean,
	isTorUpdating: boolean,
	isMinerUpdating: boolean,
	isTorEnabled: boolean,
	isMinerEnabled: boolean
}

export const SettingsActions = createActions(
  {
    START_LOCAL_NODE: undefined,
    STOP_LOCAL_NODE: undefined,

    ENABLE_MINER: undefined,
    DISABLE_MINER: undefined,

    ENABLE_TOR: undefined,
    DISABLE_TOR: undefined,

    TOGGLE_ENABLE_MINER: undefined,
    TOGGLE_ENABLE_TOR: undefined,

    // TOR_PROCESS_FAILED: (errorMessage) => ({ errorMessage }),
    // TOR_PROCESS_MURDER_FAILED: (errorMessage) => ({ errorMessage }),
    // MINER_PROCESS_FAILED: (errorMessage) => ({ errorMessage }),
    // LOCAL_NODE_PROCESS_FAILED: (errorMessage) => ({ errorMessage }),

    CHILD_PROCESS_UPDATE_STARTED: processName => ({ processName }),
    CHILD_PROCESS_UPDATE_FINISHED: processName => ({ processName }),
    CHILD_PROCESS_FAILED: (processName, errorMessage) => ({ processName, errorMessage }),
    CHILD_PROCESS_MURDER_FAILED: (processName, errorMessage) => ({ processName, errorMessage })
  },
  {
    prefix: 'APP/SETTINGS'
  }
)

export const SettingsReducer = handleActions(
  {
    [SettingsActions.daemonFinishedUpdating]: state => ({
      ...state, isDaemonUpdating: false
    }),
    [SettingsActions.startLocalNode]: state => ({
      ...state, isDaemonUpdating: true
    }),
    [SettingsActions.stopLocalNode]: state => ({
      ...state, isMinerEnabled: false, isDaemonUpdating: true
    }),
    [SettingsActions.enableMiner]: state => ({
      ...state, isMinerEnabled: true
    }),
    [SettingsActions.toggleEnableMiner]: state => ({
      ...state, isMinerEnabled: !state.isMinerEnabled
    }),
    [SettingsActions.minerProcessFailed]: state => ({
      ...state, isMinerEnabled: false
    }),
    [SettingsActions.enableTor]: state => ({
      ...state, isTorEnabled: true
    }),
    [SettingsActions.toggleEnableTor]: state => ({
      ...state, isTorEnabled: !state.isTorEnabled
    }),
    [SettingsActions.torProcessFailed]: state => ({
      ...state, isTorEnabled: false
    }),
    [SettingsActions.torProcessMurderFailed]: state => ({
      ...state, isTorEnabled: true
    }),
  },
  preloadedAppState.settings
)
