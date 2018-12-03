// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export type PrivateOrderStatus = 'swapping_rel_res' | 'privatizing' | 'swapping_res_base' | 'completed' | 'failed' | 'cancelled'

export const ResDexBuySellActions = createActions(
  {
    EMPTY: undefined,

    SELECT_TAB: index => ({ index }),

    GET_ORDER_BOOK: undefined,
    GOT_ORDER_BOOK: orderBook => ({ orderBook }),
    GET_ORDER_BOOK_FAILED: (errorMessage: string) => ({ errorMessage }),

    UPDATE_BASE_CURRENCY: (symbol: string) => ({ symbol }),
    UPDATE_QUOTE_CURRENCY: (symbol: string) => ({ symbol }),

    CREATE_ORDER: undefined,
    CREATE_ORDER_SUCCEEDED: undefined,
    CREATE_ORDER_FAILED: (errorMessage: string) => ({ errorMessage }),

    CREATE_PRIVATE_ORDER: undefined,
    CREATE_PRIVATE_ORDER_SUCCEEDED: undefined,
    CREATE_PRIVATE_ORDER_FAILED: (errorMessage: string) => ({ errorMessage }),

    SET_PRIVATE_ORDER_STATUS: (uuid: string, status: PrivateOrderStatus) => ({uuid, status}),
    LINK_PRIVATE_ORDER_TO_BASE_RES_ORDER: (uuid: string, baseResOrderUuid: string) => ({uuid, baseResOrderUuid}),

    CREATE_LIMIT_ORDER: undefined,
  },
  {
    prefix: 'APP/RESDEX/BUY_SELL'
  }
)

export const ResDexBuySellReducer = handleActions(
  {
    [ResDexBuySellActions.selectTab]: (state, action) => ({
      ...state,
      selectedTabIndex: action.payload.index,
      isAdvanced: action.payload.index === 1,
    }),
    [ResDexBuySellActions.gotOrderBook]: (state, action) => ({
      ...state,
      orderBook: action.payload.orderBook
    }),
    [ResDexBuySellActions.getOrderBookFailed]: state => ({
      ...state,
      orderBook: {
        ...state.orderBook,
        baseQuote: {
          bids: [],
          asks: [],
        },
        resQuote: {
          bids: [],
          asks: [],
        },
        baseRes: {
          bids: [],
          asks: [],
        }
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
    [ResDexBuySellActions.createOrder]: state => ({
      ...state,
      isSendingOrder: true,
    }),
    [ResDexBuySellActions.createOrderSucceeded]: state => ({
      ...state,
      isSendingOrder: false,
    }),
    [ResDexBuySellActions.createOrderFailed]: state => ({
      ...state,
      isSendingOrder: false,
    }),
    [ResDexBuySellActions.createPrivateOrder]: state => ({
      ...state,
      isSendingOrder: true,
    }),
    [ResDexBuySellActions.createPrivateOrderSucceeded]: state => ({
      ...state,
      isSendingOrder: false,
    }),
    [ResDexBuySellActions.createPrivateOrderFailed]: state => ({
      ...state,
      isSendingOrder: false,
    }),
  }, preloadedState)
