// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type GetStartedState = {
  isInProgress: boolean
}

export const GetStartedActions = createActions(
  {
    EMPTY: undefined,
    USE_RESISTANCE: undefined
  },
  {
    prefix: 'APP/GET_STARTED'
  }
)

export const GetStartedReducer = handleActions(
  {
    [GetStartedActions.useResistance]: state => ({ ...state, isInProgress: false }),
  }, preloadedState)
