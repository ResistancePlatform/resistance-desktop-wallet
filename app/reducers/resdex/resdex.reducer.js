// @flow
import { createActions, handleActions } from 'redux-actions'
import { combineReducers } from 'redux'

import { preloadedState } from '~/reducers/preloaded.state'
import { ChildProcessName } from '~/service/child-process-service'
import { ResDexBootstrappingReducer } from './bootstrapping/reducer'
import { ResDexLoginReducer } from './login/reducer'
import { ResDexKycReducer } from './kyc/reducer'
import { ResDexAssetsReducer } from './assets/reducer'
import { ResDexBuySellReducer } from './buy-sell/reducer'
import { ResDexOrdersReducer, PrivateOrder } from './orders/reducer'
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
  appVersion: string,
  isVerified?: boolean,
  tid?: string
}

export type CurrencyHistoryResolution = 'hour' | 'day' | 'week' | 'month' | 'year'

export type ResDexState = {
  common: {
    isExpanded: boolean,
    selectedTabIndex: number
  },
  bootstrapping: {
    isInProgress: boolean,
    isRestoring: boolean,
    generatedSeedPhrase: string | null
  },
  login: {
    isRequired: boolean,
    isInProgress: boolean,
    defaultPortfolioId: string | null,
    portfolios: Portfolio[],
    termsAndConditionsModal: {
      isVisible: boolean
    }
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
    selectedTabIndex: number,
    isAdvanced: boolean,
    baseCurrency: string,
    quoteCurrency: string,
    isSendingOrder: boolean,
    orderBook: {
      baseCurrency?: string,
      quoteCurrency?: string,
      baseQuote: {
        ['bids' | 'asks']: Order[]
      },
      resQuote: {
        ['bids' | 'asks']: Order[]
      },
      baseRes: {
        ['bids' | 'asks']: Order[]
      }
    },
    enhancedPrivacy: boolean,
    ohlc: object[],
    ohlcPair: {
      baseCurrency?: string,
      quoteCurrency?: string
    },
    trades: object[],
    tradesPair: {
      baseCurrency?: string,
      quoteCurrency?: string
    },
    tradingChart: {
      period: string,
      type: 'candlestick' | 'heikin-ashi' | 'kagi' | 'point-figure' | 'renko',
      indicators: {
        [key: string]: object
      },
      interactiveMode: string | null,
      interactive: {[key: string]: any}
    },
    indicatorsModal: {
      isVisible: boolean,
      searchString: string,
      formKey: string | null
    },
    editTextModal: {
      isVisible: boolean,
      sumbitCallback: func | null,
      defaultText: string,
      type: 'label' | 'alert'
    },
    tradingChartModal: {
      isVisible: boolean
    }
  },
  orders: {
    isInitialKickStartDone: boolean,
    pendingSwaps: {},
    swapHistory: [],
    privateSwaps: {[string]: PrivateOrder},
    orderModal: {
      isVisible: boolean,
      uuid: string | null
    },
    isCancelling: boolean
  },
  accounts: {
    selectedSymbol: string,
    transactions: { [string]: any },
    currencies: { [ChildProcessName]: { [string]: Currency } },
    enabledCurrencies: EnabledCurrency[],
    currencyFees: { [string]: any },
    dynamicTrust: { [string]: object },
    zCredit: object | null,
    addCurrencyModal: {
      isInEditMode: boolean,
      isVisible: boolean,
      defaultValues: {
        symbol: string | null,
        rpcPort: number | null,
        useElectrum: boolean
      }
    },
    instantDexDepositModal: {
      isVisible: boolean
    },
    depositModal: {
      isVisible: boolean,
      isResDex2Visible: boolean,
      symbol: string | null
    },
    withdrawModal: {
      isInProgress: boolean,
      isVisible: boolean,
      symbol: string | null,
      secretFunds: boolean
    }
  }
}

export const ResDexActions = createActions(
  {
    EMPTY: undefined,
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
      isExpanded: action.payload.index === 2,
    }),
  }, preloadedState)

export const ResDexReducer = combineReducers({
  common: ResDexCommonReducer,
  kyc: ResDexKycReducer,
  bootstrapping: ResDexBootstrappingReducer,
  login: ResDexLoginReducer,
  assets: ResDexAssetsReducer,
  buySell: ResDexBuySellReducer,
  orders: ResDexOrdersReducer,
  accounts: ResDexAccountsReducer,
})
