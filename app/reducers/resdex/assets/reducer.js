// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export const ResDexAssetsActions = createActions(
  {
    EMPTY: undefined,

    GET_CURRENCY_HISTORY: undefined,
    GOT_CURRENCY_HISTORY: history => ({ history }),

  },
  {
    prefix: 'APP/RESDEX/ASSETS'
  }
)

export const ResDexAssetsReducer = handleActions(
  {
  }, preloadedState)
