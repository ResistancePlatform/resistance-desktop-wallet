// @flow
import { translate } from '~/i18next.config'
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

import { RESDEX } from '~/constants/resdex'

export type PrivateOrderStatus = 'swapping_rel_res' | 'privatizing' | 'swapping_res_base' | 'completed' | 'failed' | 'cancelled'

const t = translate('resdex')

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

    SHOW_INDICATORS_MODAL: (type: string, submitCallback: func) => ({ type, submitCallback }),
    UPDATE_INDICATORS_SEARCH_STRING: (searchString: string) => ({searchString}),
    EDIT_INDICATOR: (key: string) => ({key}),
    CANCEL_INDICATOR_EDITION: (key: string) => ({key}),
    REMOVE_INDICATOR: (key: string) => ({key}),
    SAVE_INDICATOR: (key: string) => ({key}),
    UPDATE_INDICATOR: (key: string, config: object) => ({key, config}),
    RESET_INDICATOR: (key: string) => ({key}),
    CLOSE_INDICATORS_MODAL: undefined,

    UPDATE_INTERACTIVE_MODE: (mode: string | null) => ({ mode }),
    UPDATE_INTERACTIVE: (config: object) => ({ ...config }),

    SHOW_EDIT_TEXT_MODAL: undefined,
    CLOSE_EDIT_TEXT_MODAL: undefined,
  },
  {
    prefix: 'APP/RESDEX/BUY_SELL'
  }
)

function getIndicators(key: string, indicators: object) {
  if (indicators[key]) {
    return indicators
  }

  const newIndicator = RESDEX.getAvailableIndicators(t).find(i => i.key === key)

  const updatedIndicators = {
    ...indicators,
    [key]: {...newIndicator}
  }

  return updatedIndicators
}

function removeIndicator(key: string, indicators: object) {
  const result = {...indicators}
  delete result[key]
  return result
}

export const ResDexBuySellReducer = handleActions(
  {
    // Trading

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


    // Advanced Trading

    [ResDexBuySellActions.gotOhlc]: (state, action) => ({
      ...state,
      ohlc: action.payload.ohlc,
    }),
    [ResDexBuySellActions.gotTrades]: (state, action) => ({
      ...state,
      trades: action.payload.trades,
    }),

    // Chart Settings

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

    // Indicators

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
      tradingChart: {
        ...state.tradingChart,
        indicators: getIndicators(action.payload.key, state.tradingChart.indicators)
      },
      indicatorsModal: {
        ...state.indicatorsModal,
        formKey: action.payload.key
      },
    }),
    [ResDexBuySellActions.cancelIndicatorEdition]: (state, action) => ({
      ...state,
      indicatorsModal: {
        ...state.indicatorsModal,
        formKey: action.payload.key === state.indicatorsModal.formKey
          ? null
          : state.indicatorsModal.formKey
      }
    }),
    [ResDexBuySellActions.removeIndicator]: (state, action) => ({
      ...state,
      tradingChart: {
        ...state.tradingChart,
        indicators: removeIndicator(action.payload.key, state.tradingChart.indicators)
      },
    }),
    [ResDexBuySellActions.updateIndicator]: (state, action) => ({
      ...state,
      tradingChart: {
        ...state.tradingChart,
        indicators: {
          ...state.tradingChart.indicators,
          [action.payload.key]: action.payload.config
        }
      },
    }),
    [ResDexBuySellActions.closeIndicatorsModal]: state => ({
      ...state,
      indicatorsModal: {
        ...state.indicatorsModal,
        isVisible: false
      }
    }),

    // Interactive

    [ResDexBuySellActions.updateInteractiveMode]: (state, action) => ({
      ...state,
      tradingChart: {
        ...state.tradingChart,
        interactiveMode: action.payload.mode
      }
    }),
    [ResDexBuySellActions.updateInteractive]: (state, action) => ({
      ...state,
      tradingChart: {
        ...state.tradingChart,
        interactive: {
          ...state.tradingChart.interactive,
          ...action.payload
        }
      }
    }),
    [ResDexBuySellActions.showEditTextModal]: (state, action) => ({
      ...state,
      indicatorsModal: {
        ...state.editTextModal,
        type: action.payload.type,
        submitCallback: action.payload.submitCallback,
        isVisible: true
      }
    }),
    [ResDexBuySellActions.closeEditTextModal]: state => ({
      ...state,
      indicatorsModal: {
        ...state.editTextModal,
        isVisible: false
      }
    }),
  }, preloadedState)
