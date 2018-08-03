// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedAppState } from '../appState'

export type SettingsState = {
	isTorEnabled: boolean,
	isMinerEnabled: boolean,
  childProcessUpdate: {
      NODE: boolean,
      MINER: boolean,
      TOR: boolean
  }
}

export const SettingsActions = createActions(
  {
    START_LOCAL_NODE: undefined,
    STOP_LOCAL_NODE: undefined,

    ENABLE_MINER: undefined,
    DISABLE_MINER: undefined,

    ENABLE_TOR: undefined,
    DISABLE_TOR: undefined,

    CHILD_PROCESS_STARTED: processName => ({ processName }),
    CHILD_PROCESS_FAILED: (processName, errorMessage) => ({ processName, errorMessage }),
    CHILD_PROCESS_MURDERED: processName => ({ processName }),
    CHILD_PROCESS_MURDER_FAILED: (processName, errorMessage) => ({ processName, errorMessage })
  },
  {
    prefix: 'APP/SETTINGS'
  }
)

const getChildProcessUpdateFinishedState = (state, action) => {
  const newState = {...state}
  newState.childProcessUpdate[action.payload.processName] = false
  return newState
}

const getChildProcessUpdateFailedState = (state, action, isEnabled) => {
  const newState = getChildProcessUpdateFinishedState(state, action)

  switch (action.payload.processName) {
    case 'TOR':
      newState.isTorEnabled = isEnabled
      break
    case 'MINER':
      newState.isMinerEnabled = isEnabled
      break
    default:
  }

  return newState
}

export const SettingsReducer = handleActions(
  {
    // Local Node
    [SettingsActions.startLocalNode]: state => ({
      ...state,
      childProcessUpdate: { ...state.childProcessUpdate, NODE: true }
    }),
    [SettingsActions.stopLocalNode]: state => ({
      ...state,
      childProcessUpdate: { ...state.childProcessUpdate, NODE: true },
      isMinerEnabled: false
    }),

    // Miner
    [SettingsActions.enableMiner]: state => ({
      ...state,
      childProcessUpdate: { ...state.childProcessUpdate, MINER: true },
      isMinerEnabled: true
    }),
    [SettingsActions.disableMiner]: state => ({
      ...state,
      childProcessUpdate: { ...state.childProcessUpdate, MINER: true },
      isMinerEnabled: false
    }),

    // Tor
    [SettingsActions.enableTor]: state => ({
      ...state,
      childProcessUpdate: { ...state.childProcessUpdate, TOR: true },
      isTorEnabled: true
    }),
    [SettingsActions.disableTor]: state => ({
      ...state,
      childProcessUpdate: { ...state.childProcessUpdate, TOR: true },
      isTorEnabled: false
    }),

    // Child process updates
    [SettingsActions.childProcessStarted]: (state, action) => (
      getChildProcessUpdateFinishedState(state, action)
    ),
    [SettingsActions.childProcessFailed]: (state, action) => (
      getChildProcessUpdateFailedState(state, action, false)
    ),
    [SettingsActions.childProcessMurdered]: (state, action) => (
      getChildProcessUpdateFinishedState(state, action)
    ),
    [SettingsActions.childProcessMurderFailed]: (state, action) => (
      getChildProcessUpdateFailedState(state, action, true)
    )

  },
  preloadedAppState.settings
)
