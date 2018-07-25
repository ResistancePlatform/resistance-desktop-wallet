// @flow
import { AppAction } from '../appAction';

export type SettingsState = {
  isTorEnabled: boolean
};

const settingsActionTypePrefix = 'SETTINGS_ACTION';

export const SettingsActions = {
  EMPTY: `${settingsActionTypePrefix}: EMPTY`,

  TOGGLE_ENABLE_TOR: `${settingsActionTypePrefix}: TOGGLE_ENABLE_TOR`,
  TOGGLE_ENABLE_MINER: `${settingsActionTypePrefix}: TOGGLE_ENABLE_MINER`,
  TOGGLE_LOCAL_NODE: `${settingsActionTypePrefix}: TOGGLE_LOCAL_NODE`,

  toggleEnableTor: (): AppAction => ({
    type: SettingsActions.TOGGLE_ENABLE_TOR
  }),
  empty: (): AppAction => ({ type: SettingsActions.EMPTY })
};

const initState = {
  isTorEnabled: false
};

export const SettingsReducer = (
  state: SettingsState = initState,
  action: AppAction
) => {
  switch (action.type) {
    case SettingsActions.TOGGLE_ENABLE_TOR:
      return { ...state, isTorEnabled: !state.isTorEnabled };

    default:
      return state;
  }
};
