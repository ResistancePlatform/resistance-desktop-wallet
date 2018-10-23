// @flow
import { createActions, handleActions } from 'redux-actions'
import { combineReducers } from 'redux'

import { preloadedState } from '~/reducers/preloaded.state'
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
  common: {
    selectedTabIndex: number
  },
  login: {
    isRequired: boolean,
    portfolios: Portfolio[]
  },
  assets: {
    resolution: CurrencyHistoryResolution,
    currencyHistory: {
      [CurrencyHistoryResolution]: undefined | {
        [string]: {
          time: number,
          value: any
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
    selectedSymbol: string,
    transactions: { [string]: any },
    currencies: { [string]: Currency },
    enabledCurrencies: EnabledCurrency[],
    currencyFees: { [string]: any },
    addCurrencyModal: {
      isInEditMode: boolean,
      isVisible: boolean,
      symbol: string | null
    },
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

    SELECT_TAB: index => ({ index }),
  },
  {
    prefix: 'APP/RESDEX'
  }
)

export const ResDexCommonReducer = handleActions(
  {
    [ResDexActions.selectTab]: (state, action) => ({
      ...state,
      selectedTabIndex: action.payload.index,
    }),
  }, preloadedState)

export const ResDexReducer = combineReducers({
  common: ResDexCommonReducer,
  login: ResDexLoginReducer,
  assets: ResDexAssetsReducer,
  buySell: ResDexBuySellReducer,
  orders: ResDexOrdersReducer,
  accounts: ResDexAccountsReducer,
})
