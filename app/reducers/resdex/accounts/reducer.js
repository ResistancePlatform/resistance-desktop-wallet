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

    GET_CURRENCIES: undefined,
    GOT_CURRENCIES: (currencies: Currency[]) => ({ currencies }),
    GET_CURRENCIES_FAILED: (errorMessage: string) => ({ errorMessage }),

    DEPOSIT: (symbol: string) => ({ symbol }),
    WITHDRAW: (symbol: string) => ({ symbol }),
    CLOSE_DEPOSIT_MODAL: undefined,
    CLOSE_WITHDRAW_MODAL: undefined
  },
  {
    prefix: 'APP/RESDEX/ACCOUNTS'
  }
)

export const ResDexAccountsReducer = handleActions(
  {
    [ResDexAccountsActions.gotCurrencies]: (state, action) => ({
      ...state,
      currencies: action.payload.currencies
    }),
    [ResDexAccountsActions.deposit]: (state, action) => ({
      ...state,
      depositModal: {
        isVisible: true,
        symbol: action.payload.symbol
      }
    }),
    [ResDexAccountsActions.withdraw]: (state, action) => ({
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
