// @flow
import { AppAction } from '../appAction';

export type SettingsState = {
  isTorEnabled: boolean,
  isMinerEnabled: boolean
};

const settingsActionTypePrefix = 'SETTINGS_ACTION';

export const SettingsActions = {
  EMPTY: `${settingsActionTypePrefix}: EMPTY`,

  TOGGLE_ENABLE_TOR: `${settingsActionTypePrefix}: TOGGLE_ENABLE_TOR`,
  TOGGLE_ENABLE_MINER: `${settingsActionTypePrefix}: TOGGLE_ENABLE_MINER`,
  START_LOCAL_NODE: `${settingsActionTypePrefix}: START_LOCAL_NODE`,
  STOP_LOCAL_NODE: `${settingsActionTypePrefix}: STOP_LOCAL_NODE`,

  toggleEnableMiner: (): AppAction => ({
    type: SettingsActions.TOGGLE_ENABLE_MINER
  }),
  toggleEnableTor: (): AppAction => ({
    type: SettingsActions.TOGGLE_ENABLE_TOR
  }),

  empty: (): AppAction => ({ type: SettingsActions.EMPTY })
};

const initState = {
  isTorEnabled: false,
  isMinerEnabled: true
};

export const SettingsReducer = (
  state: SettingsState = initState,
  action: AppAction
) => {
  switch (action.type) {
    case SettingsActions.TOGGLE_ENABLE_TOR:
      return { ...state, isTorEnabled: !state.isTorEnabled };

    case SettingsActions.TOGGLE_ENABLE_MINER:
      return { ...state, isMinerEnabled: !state.isMinerEnabled };

    default:
      return state;
  }
};
