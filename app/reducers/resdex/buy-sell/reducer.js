// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export const ResDexBuySellActions = createActions(
  {
    EMPTY: undefined,
  },
  {
    prefix: 'APP/RESDEX/BUY_SELL'
  }
)

export const ResDexBuySellReducer = handleActions(
  {
  }, preloadedState)
