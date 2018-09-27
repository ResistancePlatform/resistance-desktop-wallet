// @flow
import { createActions } from 'redux-actions'
import { combineReducers } from 'redux'

import { ResDexLoginReducer } from './login/reducer'
import { ResDexAssetsReducer } from './assets/reducer'
import { ResDexBuySellReducer } from './buy-sell/reducer'
import { ResDexOrdersReducer } from './orders/reducer'
import { EnabledCurrency, ResDexAccountsReducer } from './accounts/reducer'


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
    enabledCurrencies: EnabledCurrency[],
    depositModal: {
      isVisible: boolean,
      currency: string | null
    },
    withdrawModal: {
      isVisible: boolean,
      currency: string | null
    }
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
  assets: ResDexAssetsReducer,
  buySell: ResDexBuySellReducer,
  orders: ResDexOrdersReducer,
  accounts: ResDexAccountsReducer,
})
