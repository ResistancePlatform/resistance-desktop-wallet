// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export const ResDexAssetsActions = createActions(
  {
    EMPTY: undefined,

    GET_CURRENCY_HISTORY: undefined,
    GOT_CURRENCY_HISTORY: history => ({ history }),
    GET_CURRENCY_HISTORY_FAILED: undefined,

    CHANGE_CHART_RESOLUTION: resolution => ({ resolution }),
  },
  {
    prefix: 'APP/RESDEX/ASSETS'
  }
)

export const ResDexAssetsReducer = handleActions(
  {
    [ResDexAssetsActions.gotCurrencyHistory]: (state, action) => ({
      ...state,
      currencyHistory: action.payload.history
    }),
    [ResDexAssetsActions.changeChartResolution]: (state, action) => ({
      ...state,
      resolution: action.payload.resolution
    }),
  }, preloadedState)
