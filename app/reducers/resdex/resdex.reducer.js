// @flow
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '../preloaded.state'

export type Order = {}

export type ResDexState = {
  isLoginRequired: boolean,
  assets: {
  },
  buySell: {
  },
  orders: {
    openOrders: Order[],
    completedOrders: Order[]
  },
  accounts: {
  }
}

export const ResDexActions = createActions(
  {
    EMPTY: undefined,
    ORDERS: {
      EMPTY: undefined
    }
  },
  {
    prefix: 'APP/RESDEX'
  }
)

export const ResDexReducer = handleActions(
  {
  }, preloadedState)
