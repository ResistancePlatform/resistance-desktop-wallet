// @flow
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '../preloaded.state'
import { ChildProcessName, ChildProcessStatus } from '~/service/os-service'

export type SettingsState = {
	isTorEnabled: boolean,
	isMinerEnabled: boolean,
  isStatusModalOpen: boolean,
  childProcessesStatus: { [ChildProcessName]: ChildProcessStatus },
  language: string
}

export const SettingsActions = createActions(
  {
    EMPTY: undefined,

    UPDATE_LANGUAGE: (code: string) => ({ code }),

    OPEN_STATUS_MODAL: undefined,
    CLOSE_STATUS_MODAL: undefined,

    START_LOCAL_NODE: undefined,
    RESTART_LOCAL_NODE: undefined,
    STOP_LOCAL_NODE: undefined,

    ENABLE_MINER: undefined,
    DISABLE_MINER: undefined,

    ENABLE_TOR: undefined,
    DISABLE_TOR: undefined,

    KICK_OFF_CHILD_PROCESSES: undefined,

    CHILD_PROCESS_STARTED: processName => ({ processName }),
    CHILD_PROCESS_FAILED: (processName, errorMessage) => ({ processName, errorMessage }),
    CHILD_PROCESS_RESTART_FAILED: (processName, errorMessage) => ({ processName, errorMessage }),
    CHILD_PROCESS_MURDERED: processName => ({ processName }),
    CHILD_PROCESS_MURDER_FAILED: (processName, errorMessage) => ({ processName, errorMessage }),

    INITIATE_PRIVATE_KEYS_EXPORT: undefined,
    EXPORT_PRIVATE_KEYS: filePath => ({filePath}),

    INITIATE_PRIVATE_KEYS_IMPORT: undefined,
    IMPORT_PRIVATE_KEYS: filePath => ({filePath})
  },
  {
    prefix: 'APP/SETTINGS'
  }
)

const getChildProcessUpdateFinishedState = (state, action, processStatus: ChildProcessStatus) => {
  const newState = {...state}
  newState.childProcessesStatus[action.payload.processName] = processStatus
  return newState
}

const getChildProcessUpdateFailedState = (state, action, processStatus: ChildProcessStatus, isEnabled) => {
  const newState = getChildProcessUpdateFinishedState(state, action, processStatus)

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
    // Language
    [SettingsActions.updateLanguage]: (state, action) => ({
      ...state, language: action.payload.code
    }),

    // Status Modal
    [SettingsActions.openStatusModal]: state => ({
      ...state, isStatusModalOpen: true
    }),
    [SettingsActions.closeStatusModal]: state => ({
      ...state, isStatusModalOpen: false
    }),

    // Local Node
    [SettingsActions.startLocalNode]: state => ({
      ...state,
      childProcessesStatus: { ...state.childProcessesStatus, NODE: 'STARTING' }
    }),
    [SettingsActions.restartLocalNode]: state => ({
      ...state,
      childProcessesStatus: { ...state.childProcessesStatus, NODE: 'RESTARTING' }
    }),
    [SettingsActions.stopLocalNode]: state => ({
      ...state,
      childProcessesStatus: { ...state.childProcessesStatus, NODE: 'STOPPING' }
    }),

    // Miner
    [SettingsActions.enableMiner]: state => ({
      ...state,
      childProcessesStatus: { ...state.childProcessesStatus, MINER: 'STARTING' },
      isMinerEnabled: true
    }),
    [SettingsActions.disableMiner]: state => ({
      ...state,
      childProcessesStatus: { ...state.childProcessesStatus, MINER: 'STOPPING' },
      isMinerEnabled: false
    }),

    // Tor
    [SettingsActions.enableTor]: state => ({
      ...state,
      childProcessesStatus: { ...state.childProcessesStatus, TOR: 'STARTING' },
      isTorEnabled: true
    }),
    [SettingsActions.disableTor]: state => ({
      ...state,
      childProcessesStatus: { ...state.childProcessesStatus, TOR: 'STOPPING' },
      isTorEnabled: false
    }),

    // Child process updates
    [SettingsActions.childProcessStarted]: (state, action) => (
      getChildProcessUpdateFinishedState(state, action, 'RUNNING')
    ),
    [SettingsActions.childProcessFailed]: (state, action) => (
      getChildProcessUpdateFailedState(state, action, 'FAILED', false)
    ),
    [SettingsActions.childProcessMurdered]: (state, action) => (
      getChildProcessUpdateFinishedState(state, action, 'NOT RUNNING')
    ),
    [SettingsActions.childProcessMurderFailed]: (state, action) => (
      getChildProcessUpdateFailedState(state, action, 'MURDER FAILED', true)
    )

  }, preloadedState)
