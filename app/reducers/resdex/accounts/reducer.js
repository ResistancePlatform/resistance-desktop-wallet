// @flow
import { Decimal } from 'decimal.js'
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export type Currency = {
  symbol: string,
  address: string,
  amount: Decimal,
  price: Decimal,
  balance: Decimal
}

export type EnabledCurrency = {
  symbol: string,
  port?: number,
  useElectrum: boolean
}

export const ResDexAccountsActions = createActions(
  {
    EMPTY: undefined,

    ENABLE_CURRENCIES: undefined,
    GOT_CURRENCY_FEES: fees => ({ fees }),

    GET_CURRENCIES: undefined,
    GOT_CURRENCIES: (currencies: { [string]: Currency }) => ({ currencies }),
    GET_CURRENCIES_FAILED: (errorMessage: string) => ({ errorMessage }),

    WITHDRAW: undefined,
    COPY_SMART_ADDRESS: (symbol: string) => ({ symbol }),
    DELETE_CURRENCY: (symbol: string) => ({ symbol }),
    SHOW_DEPOSIT_MODAL: (symbol: string) => ({ symbol }),
    SHOW_WITHDRAW_MODAL: (symbol: string) => ({ symbol }),
    SHOW_EDIT_CURRENCY_MODAL: (symbol: string) => ({ symbol }),
    SHOW_ADD_CURRENCY_MODAL: undefined,
    CLOSE_DEPOSIT_MODAL: undefined,
    CLOSE_WITHDRAW_MODAL: undefined,
    CLOSE_ADD_CURRENCY_MODAL: undefined,

    SELECT_CURRENCY: symbol => ({ symbol }),
    GET_TRANSACTIONS: undefined,
    GOT_TRANSACTIONS: transactions => ({ transactions }),
    GET_TRANSACTIONS_FAILED: (errorMessage: string) => ({ errorMessage }),
  },
  {
    prefix: 'APP/RESDEX/ACCOUNTS'
  }
)

export const ResDexAccountsReducer = handleActions(
  {
    [ResDexAccountsActions.selectCurrency]: (state, action) => ({
      ...state,
      selectedSymbol: action.payload.symbol,
    }),
    [ResDexAccountsActions.gotTransactions]: (state, action) => ({
      ...state,
      transactions: action.payload.transactions,
    }),
    [ResDexAccountsActions.gotCurrencyFees]: (state, action) => ({
      ...state,
      currencyFees: action.payload.fees,
    }),
    [ResDexAccountsActions.gotCurrencies]: (state, action) => ({
      ...state,
      currencies: action.payload.currencies
    }),
    [ResDexAccountsActions.showDepositModal]: (state, action) => ({
      ...state,
      depositModal: {
        isVisible: true,
        symbol: action.payload.symbol
      }
    }),
    [ResDexAccountsActions.showWithdrawModal]: (state, action) => ({
      ...state,
      withdrawModal: {
        isVisible: true,
        symbol: action.payload.symbol
      }
    }),
    [ResDexAccountsActions.closeDepositModal]: (state) => ({
      ...state,
      depositModal: { isVisible: false, symbol: null }
    }),
    [ResDexAccountsActions.closeWithdrawModal]: (state) => ({
      ...state,
      withdrawModal: { isVisible: false, symbol: null }
    }),
  }, preloadedState)
