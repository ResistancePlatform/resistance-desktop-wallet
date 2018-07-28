// @flow
import { AppAction } from '../appAction'

export type SettingsState = {
	isDaemonUpdating: boolean,
	isTorUpdating: boolean,
	isMinerUpdating: boolean,
	isTorEnabled: boolean,
	isMinerEnabled: boolean
}

const settingsActionTypePrefix = 'SETTINGS_ACTION'

export const SettingsActions = {
	EMPTY: `${settingsActionTypePrefix}: EMPTY`,

	DAEMON_FINISHED_UPDATING: `${settingsActionTypePrefix}: DAEMON_FINISHED_UPDATING`,

	START_LOCAL_NODE: `${settingsActionTypePrefix}: START_LOCAL_NODE`,
	STOP_LOCAL_NODE: `${settingsActionTypePrefix}: STOP_LOCAL_NODE`,
	LOCAL_NODE_PROCESS_FAILED: `${settingsActionTypePrefix}: LOCAL_NODE_PROCESS_FAILED`,

  ENABLE_TOR: `${settingsActionTypePrefix}: ENABLE_TOR`,
	TOGGLE_ENABLE_TOR: `${settingsActionTypePrefix}: TOGGLE_ENABLE_TOR`,

  ENABLE_MINER: `${settingsActionTypePrefix}: ENABLE_MINER`,
	TOGGLE_ENABLE_MINER: `${settingsActionTypePrefix}: TOGGLE_ENABLE_MINER`,
  MINER_PROCESS_FAILED: `${settingsActionTypePrefix}: MINER_PROCESS_FAILED`,

  TOR_PROCESS_FAILED: `${settingsActionTypePrefix}: TOR_PROCESS_FAILED`,
  TOR_PROCESS_MURDER_FAILED: `${settingsActionTypePrefix}: TOR_PROCESS_MURDER_FAILED`,

	finishDaemonUpdate: (): AppAction => ({ type: SettingsActions.DAEMON_FINISHED_UPDATING }),
	startLocalNode: (): AppAction => ({ type: SettingsActions.START_LOCAL_NODE }),
	stopLocalNode: (): AppAction => ({ type: SettingsActions.STOP_LOCAL_NODE }),
	enableMiner: (): AppAction => ({ type: SettingsActions.ENABLE_MINER }),
	toggleEnableMiner: (): AppAction => ({ type: SettingsActions.TOGGLE_ENABLE_MINER }),
	enableTor: (): AppAction => ({ type: SettingsActions.ENABLE_TOR }),
	toggleEnableTor: (): AppAction => ({ type: SettingsActions.TOGGLE_ENABLE_TOR }),
  failLocalNodeProcess: (errorMessage): AppAction => ({
    type: SettingsActions.LOCAL_NODE_PROCESS_FAILED,
    payload: {errorMessage}
  }),
  failMinerProcess: (errorMessage): AppAction => ({
    type: SettingsActions.MINER_PROCESS_FAILED,
    payload: {errorMessage}
  }),
  failTorProcess: (errorMessage): AppAction => ({
    type: SettingsActions.TOR_PROCESS_FAILED,
    payload: {errorMessage}
  }),
  failTorProcessMurder: (errorMessage): AppAction => ({
    type: SettingsActions.TOR_PROCESS_MURDER_FAILED,
    payload: {errorMessage}
  }),

	empty: (): AppAction => ({ type: SettingsActions.EMPTY })
}

const initState = {
	isDaemonUpdating: false,
	isTorUpdating: false,
	isMinerUpdating: false,
	isTorEnabled: false,
	isMinerEnabled: true
}

export const SettingsReducer = (state: SettingsState = initState, action: AppAction) => {
	switch (action.type) {
		case SettingsActions.DAEMON_FINISHED_UPDATING:
			return { ...state, isDaemonUpdating: false }

		case SettingsActions.START_LOCAL_NODE:
			return { ...state, isDaemonUpdating: true }

		case SettingsActions.STOP_LOCAL_NODE:
			return { ...state, isMinerEnabled: false, isDaemonUpdating: true }

		case SettingsActions.ENABLE_TOR:
			return { ...state, isTorEnabled: true }

		case SettingsActions.TOGGLE_ENABLE_TOR:
			return { ...state, isTorEnabled: !state.isTorEnabled }

		case SettingsActions.ENABLE_MINER:
			return { ...state, isMinerEnabled: true }

		case SettingsActions.TOGGLE_ENABLE_MINER:
			return { ...state, isMinerEnabled: !state.isMinerEnabled }

		case SettingsActions.MINER_PROCESS_FAILED:
			return { ...state, isMinerEnabled: false }

		case SettingsActions.TOR_PROCESS_FAILED:
			return { ...state, isTorEnabled: false }

		case SettingsActions.TOR_PROCESS_MURDER_FAILED:
			return { ...state, isTorEnabled: true }

		default:
			return state
	}
}
