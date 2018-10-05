// @flow
import { createActions } from 'redux-actions'
import { combineReducers } from 'redux'

import { preloadedState } from '~/reducers/preloaded.state'
import { ResDexLoginActions, ResDexLoginReducer } from './login/reducer'

export type Order = {}

export type Portfolio = {
  name: string,
  encryptedSeedPhrase: string,
  appVersion: string
}

export type ResDexState = {
  login: {
    isRequired: boolean,
    portfolios: Portfolio[]
  },
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
  },
  {
    prefix: 'APP/RESDEX'
  }
)

export const ResDexReducer = combineReducers({
  login: ResDexLoginReducer,
  assets: (arg1, arg2) => arg2,
  buySell: (arg1, arg2) => arg2,
  orders: (arg1, arg2) => preloadedState.resDex.orders,
  accounts: (arg1, arg2) => arg2,
})
