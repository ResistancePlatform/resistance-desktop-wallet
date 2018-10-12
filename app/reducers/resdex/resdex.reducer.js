// @flow
import { createActions } from 'redux-actions'
import { combineReducers } from 'redux'

import { ResDexLoginReducer } from './login/reducer'
import { ResDexAssetsReducer } from './assets/reducer'
import { ResDexBuySellReducer } from './buy-sell/reducer'
import { ResDexOrdersReducer } from './orders/reducer'
import { EnabledCurrency, ResDexAccountsReducer } from './accounts/reducer'


export type Order = {}
  // id?: string,
  // address?: string,
  // depth: any,
  // price: Decimal,
  // averageVolume: Decimal,
  // maxVolume: Decimal,
  // utxoCount: number,
  // zCredits: any

export type Portfolio = {
  name: string,
  encryptedSeedPhrase: string,
  appVersion: string
}

export type CurrencyHistoryResolution = 'hour' | 'day' | 'week' | 'month' | 'year'

export type ResDexState = {
  login: {
    isRequired: boolean,
    portfolios: Portfolio[]
  },
  assets: {
    resolution: CurrencyHistoryResolution,
    currencyHistory: {
      [CurrencyHistoryResolution]: {
        [string]: {
          time: number,
          value: number
        }[]
      }
    }
  },
  buySell: {
    baseCurrency: string,
    quoteCurrency: string,
    isSendingOrder: boolean,
    orderBook: {
      baseCurrency?: string,
      quoteCurrency?: string,
      ['bids' | 'asks']: Order[]
    }
  },
  orders: {
    swapHistory: []
  },
  accounts: {
    currencies: { [string]: Currency },
    enabledCurrencies: EnabledCurrency[],
    depositModal: {
      isVisible: boolean,
      symbol: string | null
    },
    withdrawModal: {
      isVisible: boolean,
      symbol: string | null
    }
  }
}

export const ResDexActions = createActions(
  {
    EMPTY: undefined,

    START_RESDEX: undefined,
    STOP_RESDEX: undefined,
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
