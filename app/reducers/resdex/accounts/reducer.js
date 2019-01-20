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
  rpcPort?: number,
  useElectrum: boolean
}

export const ResDexAccountsActions = createActions(
  {
    EMPTY: undefined,

    GOT_CURRENCY_FEES: fees => ({ fees }),

    GET_CURRENCIES: undefined,
    GOT_CURRENCIES: (currencies: { [ChildProcessName]: { [string]: Currency } }) => ({ currencies }),
    GET_CURRENCIES_FAILED: (errorMessage: string) => ({ errorMessage }),

    GET_Z_CREDITS: undefined,
    GOT_Z_CREDITS: (zCredits: object | null) => ({ zCredits }),
    GET_Z_CREDITS_FAILED: undefined,

    UPDATE_ENABLED_CURRENCIES: (enabledCurrencies: EnabledCurrency[]) => ({ enabledCurrencies }),

    INSTANT_DEX_DEPOSIT: undefined,
    INSTANT_DEX_DEPOSIT_FAILED: undefined,

    WITHDRAW: undefined,
    UPDATE_WITHDRAWAL_SYMBOL: (symbol: string) => ({ symbol }),
    WITHDRAWAL_FAILED: undefined,

    ADD_CURRENCY: undefined,
    UPDATE_CURRENCY: undefined,
    COPY_SMART_ADDRESS: (symbol: string) => ({ symbol }),
    CONFIRM_CURRENCY_DELETION: (symbol: string) => ({ symbol }),
    DELETE_CURRENCY: (symbol: string) => ({ symbol }),
    SHOW_INSTANT_DEX_DEPOSIT_MODAL: undefined,
    SHOW_DEPOSIT_MODAL: (symbol: string) => ({ symbol }),
    SHOW_WITHDRAW_MODAL: (symbol: string | null, secretFunds: boolean = false) => ({ symbol, secretFunds }),
    SHOW_EDIT_CURRENCY_MODAL: (currency: object) => currency,
    SHOW_ADD_CURRENCY_MODAL: undefined,
    CLOSE_INSTANT_DEX_DEPOSIT_MODAL: undefined,
    CLOSE_DEPOSIT_MODAL: undefined,
    CLOSE_WITHDRAW_MODAL: undefined,
    CLOSE_ADD_CURRENCY_MODAL: undefined,

    SELECT_CURRENCY: symbol => ({ symbol }),
    GET_TRANSACTIONS: undefined,
    GOT_CURRENCY_TRANSACTIONS: (symbol: string, transactions: object[] | null) => ({ symbol, transactions }),
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
    [ResDexAccountsActions.gotCurrencyTransactions]: (state, action) => ({
      ...state,
      transactions: {
        ...state.transactions,
        [action.payload.symbol]: action.payload.transactions,
      }
    }),
    [ResDexAccountsActions.gotCurrencyFees]: (state, action) => ({
      ...state,
      currencyFees: action.payload.fees,
    }),
    [ResDexAccountsActions.gotCurrencies]: (state, action) => ({
      ...state,
      currencies: action.payload.currencies
    }),
    [ResDexAccountsActions.gotZCredits]: (state, action) => ({
      ...state,
      zCredits: action.payload.zCredits
    }),
    [ResDexAccountsActions.showInstantDexDepositModal]: state => ({
      ...state,
      instantDexDepositModal: {
        isVisible: true,
        isInProgress: false
      }
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
        isInProgress: false,
        symbol: action.payload.symbol,
        secretFunds: action.payload.secretFunds
      }
    }),
    [ResDexAccountsActions.showEditCurrencyModal]: (state, action) => ({
      ...state,
      selectedSymbol: action.payload.symbol,
      addCurrencyModal: {
        isInEditMode: true,
        defaultValues: action.payload,
        isVisible: true
      }
    }),
    [ResDexAccountsActions.showAddCurrencyModal]: state => ({
      ...state,
      addCurrencyModal: {
        isInEditMode: false,
        defaultValues: {
          symbol: null,
          rpcPort: null,
          useElectrum: true
        },
        isVisible: true
      }
    }),
    [ResDexAccountsActions.updateWithdrawalSymbol]: (state, action) => ({
      ...state,
      withdrawModal: {
        ...state.withdrawModal,
        symbol: action.payload.symbol,
      }
    }),
    [ResDexAccountsActions.updateEnabledCurrencies]: (state, action) => ({
      ...state,
      enabledCurrencies: action.payload.enabledCurrencies
    }),
    [ResDexAccountsActions.withdraw]: (state) => ({
      ...state,
      withdrawModal: {
        ...state.withdrawModal,
        isInProgress: true
      }
    }),
    [ResDexAccountsActions.closeInstantDexDepositModal]: state => ({
      ...state,
      instantDexDepositModal: {
        isVisible: false,
        isInProgress: false
      }
    }),
    [ResDexAccountsActions.closeDepositModal]: state => ({
      ...state,
      depositModal: { isVisible: false, symbol: null }
    }),
    [ResDexAccountsActions.withdrawalFailed]: (state) => ({
      ...state,
      withdrawModal: {
        ...state.withdrawModal,
        isInProgress: false
      }
    }),
    [ResDexAccountsActions.closeWithdrawModal]: (state) => ({
      ...state,
      withdrawModal: {
        isVisible: false,
        isInProgress: false,
        symbol: null,
        secretFunds: false
      }
    }),
    [ResDexAccountsActions.closeAddCurrencyModal]: state => ({
      ...state,
      addCurrencyModal: {
        isInEditMode: false,
        isVisible: false,
        defaultValues: {
          symbol: null,
          rpcPort: null,
          useElectrum: true
        },
      }
    }),
  }, preloadedState)
