// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export const ResDexBuySellActions = createActions(
  {
    EMPTY: undefined,

    GET_ORDER_BOOK: undefined,
    GOT_ORDER_BOOK: orderBook => ({ orderBook }),
    GET_ORDER_BOOK_FAILED: (errorMessage: string) => ({ errorMessage }),

    UPDATE_BASE_CURRENCY: (symbol: string) => ({ symbol }),
    UPDATE_QUOTE_CURRENCY: (symbol: string) => ({ symbol }),

    CREATE_MARKET_ORDER: undefined,
    CREATE_MARKET_ORDER_SUCCEEDED: undefined,
    CREATE_MARKET_ORDER_FAILED: (errorMessage: string) => ({ errorMessage }),

    CREATE_LIMIT_ORDER: undefined,
  },
  {
    prefix: 'APP/RESDEX/BUY_SELL'
  }
)

export const ResDexBuySellReducer = handleActions(
  {
    [ResDexBuySellActions.gotOrderBook]: (state, action) => ({
      ...state,
      orderBook: action.payload.orderBook
    }),
    [ResDexBuySellActions.getOrderBookFailed]: state => ({
      ...state,
      orderBook: {
        asks: [],
        bids: [],
      }
    }),
    [ResDexBuySellActions.updateBaseCurrency]: (state, action) => ({
      ...state,
      baseCurrency: action.payload.symbol,
    }),
    [ResDexBuySellActions.updateQuoteCurrency]: (state, action) => ({
      ...state,
      quoteCurrency: action.payload.symbol,
    }),
    [ResDexBuySellActions.createMarketOrder]: state => ({
      ...state,
      isSendingOrder: true,
    }),
    [ResDexBuySellActions.createMarketOrderSucceeded]: state => ({
      ...state,
      isSendingOrder: false,
    }),
    [ResDexBuySellActions.createMarketOrderFailed]: state => ({
      ...state,
      isSendingOrder: false,
    }),
  }, preloadedState)
