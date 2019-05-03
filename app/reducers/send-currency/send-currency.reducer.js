// @flow
import { Decimal } from 'decimal.js'
import { createActions, handleActions } from 'redux-actions'

// import { i18n } from '~/i18next.config'
import { preloadedState } from '../preloaded.state'


// const t = i18n.getFixedT(null, 'send-currency')

export type SendFromRadioButtonType = 'transparent' | 'private'

export type AddressDropdownItem = {
	address: string,
	balance: Decimal | null,
	disabled?: boolean
}

export type SendCurrencyState = {
  fromAddress?: string,
	arePrivateTransactionsEnabled: boolean,
  addresses: AddressDropdownItem[],
  isSending: boolean
}

export const SendCurrencyActions = createActions(
  {
    EMPTY: undefined,

    GET_ADDRESSES: (searchString?: string) => ({ searchString }),
    GOT_ADDRESSES: (addresses: AddressDropdownItem[]) => ({ addresses }),

    UPDATE_FROM_ADDRESS: (address: string) => ({ address }),

    TOGGLE_PRIVATE_TRANSACTIONS: areEnabled => ({ areEnabled }),

    SEND_CURRENCY: undefined,
    SEND_CURRENCY_OPERATION_STARTED: undefined,
    SEND_CURRENCY_OPERATION_FAILED: (errorMessage: string) => ({ errorMessage }),
  },
  {
    prefix: `APP/SEND_CURRENCY`
  }
)

export const SendCurrencyReducer = handleActions({
  [SendCurrencyActions.updateFromAddress]: (state, action) => ({
    ...state,
    fromAddress: action.payload.address
  }),

  [SendCurrencyActions.gotAddresses]: (state, action) => ({
    ...state,
    addresses: action.payload.addresses
  }),

  [SendCurrencyActions.sendCurrency]: state => ({
    ...state, isSending: true
  }),
  [SendCurrencyActions.sendCurrencyOperationStarted]: state => ({
    ...state,
    isInputDisabled: false
  }),
  [SendCurrencyActions.sendCurrencyOperationFailed]: state => ({
    ...state, isInputDisabled: false
  }),

  [SendCurrencyActions.togglePrivateTransactions]: (state, action) => ({
    ...state,
    arePrivateTransactionsEnabled: action.payload.areEnabled
  }),
}, preloadedState)
