// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type GetStartedState = {
  isInProgress: boolean
}

export const GetStartedActions = createActions(
  {
    EMPTY: undefined,
    COMPLETE_GET_STARTED: undefined
  },
  {
    prefix: 'APP/GET_STARTED'
  }
)

export const GetStartedReducer = handleActions(
  {
  }, preloadedState)
