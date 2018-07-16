// @flow
import { AppAction } from '../appAction'

export type NaviPath = '/' | '/overview' | '/own-addresses' | '/send-cash' | '/address-book' | '/settings'

export type NaviState = {
  currentNaviPath: NaviPath
}

const NaviActionTypePrefix = 'NAVI_ACTION'

export const NaviActions = {
  EMPTY: `${NaviActionTypePrefix}: EMPTY`,

  NAVI_TO_PATH_SUCCESS: `${NaviActionTypePrefix}: NAVI_TO_PATH_SUCCESS`,

  MAIN_WINDOW_CLOSE: `${NaviActionTypePrefix}: MAIN_WINDOW_CLOSE`,
  MAIN_WINDOW_MINIMIZE: `${NaviActionTypePrefix}: MAIN_WINDOW_MINIMIZE`,
  MAIN_WINDOW_MAXIMIZE: `${NaviActionTypePrefix}: MAIN_WINDOW_MAXIMIZE`,

  naviToPathSuccess: (naviPath: NaviPath): AppAction => ({ type: NaviActions.NAVI_TO_PATH_SUCCESS, payload: naviPath }),

  mainWindowClose: (): AppAction => ({ type: NaviActions.MAIN_WINDOW_CLOSE }),
  mainWindowMinimize: (): AppAction => ({ type: NaviActions.MAIN_WINDOW_MINIMIZE }),
  mainWindowMaximize: (): AppAction => ({ type: NaviActions.MAIN_WINDOW_MAXIMIZE }),

  empty: (): AppAction => ({ type: NaviActions.EMPTY })
}

const initState: NaviState = {
  currentNaviPath: '/overview'
}

export const NaviReducer = (state: NaviState = initState, action: AppAction) => {

  switch (action.type) {
    case NaviActions.NAVI_TO_PATH_SUCCESS:
      return { ...state, currentNaviPath: action.payload }

    default:
      return state
  }
}