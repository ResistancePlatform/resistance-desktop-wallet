// @flow
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '../preloaded.state'

export type Order = {}

export type Portfolio = {
  name: string,
  encryptedSeedPhrase: string,
  appVersion: string
}

export type ResDexState = {
  login: {
    isRequired: boolean,
    portfolios: { [string]: Portfolio}
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
    LOGIN: (portfolio: string, password: string) => ({ portfolio, password })
  },
  {
    prefix: 'APP/RESDEX'
  }
)

export const ResDexReducer = handleActions(
  {
  }, preloadedState)
