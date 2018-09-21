// @flow
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '../preloaded.state'

export type ResDexState = {
  assets: {
  },
  buySell: {
  },
  orders: {
  },
  accounts: {
  }
}

export const ResDexActions = createActions(
  {
    EMPTY: undefined,
  },
  {
    prefix: 'APP/RESDEX'
  }
)

export const ResDexReducer = handleActions(
  {
  }, preloadedState)
