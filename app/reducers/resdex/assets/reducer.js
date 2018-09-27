// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export const ResDexAssetsActions = createActions(
  {
    EMPTY: undefined,
  },
  {
    prefix: 'APP/RESDEX/ASSETS'
  }
)

export const ResDexAssetsReducer = handleActions(
  {
  }, preloadedState)
