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

    GET_OHLC: undefined,
    GOT_OHLC: (ohlc: object[]) => ({ ohlc }),
    GET_OHLC_FAILED: undefined,

    GET_TRADES: undefined,
    GOT_TRADES: (trades: object[]) => ({ trades }),
    GET_TRADES_FAILED: undefined,

    UPDATE_CHART_SETTINGS: (settings: object) => ({ ...settings }),
    UPDATE_CHART_PERIOD: (period: string) => ({ period }),

    SHOW_INDICATORS_MODAL: undefined,
    UPDATE_INDICATORS_SEARCH_STRING: (searchString: string) => ({searchString}),
    EDIT_INDICATOR: (key: string) => ({key}),
    CLOSE_INDICATORS_MODAL: undefined,
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
    [ResDexBuySellActions.gotOhlc]: (state, action) => ({
      ...state,
      ohlc: action.payload.ohlc,
    }),
    [ResDexBuySellActions.gotTrades]: (state, action) => ({
      ...state,
      trades: action.payload.trades,
    }),
    [ResDexBuySellActions.updateChartSettings]: (state, action) => ({
      ...state,
      tradingChart: {
        ...state.tradingChart,
        ...action.payload
      }
    }),
    [ResDexBuySellActions.updateChartPeriod]: (state, action) => ({
      ...state,
      ohlc: [],
      tradingChart: {
        ...state.tradingChart,
        period: action.payload.period
      }
    }),
    [ResDexBuySellActions.showIndicatorsModal]: state => ({
      ...state,
      indicatorsModal: {
        ...state.indicatorsModal,
        isVisible: true
      }
    }),
    [ResDexBuySellActions.updateIndicatorsSearchString]: (state, action) => ({
      ...state,
      indicatorsModal: {
        ...state.indicatorsModal,
        searchString: action.payload.searchString
      }
    }),
    [ResDexBuySellActions.editIndicator]: (state, action) => ({
      ...state,
      indicatorsModal: {
        ...state.indicatorsModal,
        formKey: action.payload.key
      }
    }),
    [ResDexBuySellActions.closeIndicatorsModal]: state => ({
      ...state,
      indicatorsModal: {
        ...state.indicatorsModal,
        isVisible: false
      }
    }),
  }, preloadedState)
