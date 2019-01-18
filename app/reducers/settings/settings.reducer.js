// @flow
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '../preloaded.state'
import { ChildProcessName, ChildProcessStatus } from '~/service/child-process-service'

export type SettingsState = {
	isTorEnabled: boolean,
  cpuCoresNumber: number,
	isMinerEnabled: boolean,
  isStatusModalOpen: boolean,
  statusModalTabIndex: number,
  childProcessesStatus: { [ChildProcessName]: ChildProcessStatus },
  language: string
}

export const SettingsActions = createActions(
  {
    EMPTY: undefined,

    UPDATE_LANGUAGE: (code: string) => ({ code }),

    OPEN_STATUS_MODAL: (tabIndex?: number) => ({ tabIndex }),
    CLOSE_STATUS_MODAL: undefined,

    TOGGLE_LOCAL_NODE: undefined,
    START_LOCAL_NODE: undefined,
    RESTART_LOCAL_NODE: undefined,
    STOP_LOCAL_NODE: undefined,

    START_ETOMIC_NODE: undefined,
    STOP_ETOMIC_NODE: undefined,

    TOGGLE_MINER: undefined,
    ENABLE_MINER: undefined,
    DISABLE_MINER: undefined,
    SET_CPU_CORES_NUMBER: (cpuCoresNumber: number) => ({ cpuCoresNumber }),

    TOGGLE_TOR: undefined,
    ENABLE_TOR: undefined,
    DISABLE_TOR: undefined,

    START_RESDEX: undefined,

    INITIATE_WALLET_BACKUP: undefined,
    BACKUP_WALLET: filePath => ({filePath}),
    INITIATE_WALLET_RESTORE: undefined,
    RESTORE_WALLET: filePath => ({filePath}),
    RESTORING_WALLET_FAILED: (errorMessage: string = '') => ({ errorMessage }),
    RESTORING_WALLET_SUCCEEDED: undefined,

    KICK_OFF_CHILD_PROCESSES: undefined,

    CHILD_PROCESS_STARTED: processName => ({ processName }),
    CHILD_PROCESS_FAILED: (processName, errorMessage) => ({ processName, errorMessage }),
    CHILD_PROCESS_RESTART_FAILED: (processName, errorMessage) => ({ processName, errorMessage }),
    CHILD_PROCESS_MURDERED: processName => ({ processName }),
    CHILD_PROCESS_MURDER_FAILED: (processName, errorMessage) => ({ processName, errorMessage }),

    STOP_CHILD_PROCESSES: undefined,
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
    [SettingsActions.openStatusModal]: (state, action) => ({
      ...state,
      isStatusModalOpen: true,
      statusModalTabIndex: action.payload.tabIndex || 0
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
    [SettingsActions.setCpuCoresNumber]: (state, action) => ({
      ...state,
      cpuCoresNumber: action.payload.cpuCoresNumber
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

    // ResDEX
    [SettingsActions.startResdex]: state => ({
      ...state,
      childProcessesStatus: { ...state.childProcessesStatus, RESDEX: 'STARTING' }
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
