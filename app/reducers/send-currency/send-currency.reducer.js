// @flow
import { Decimal } from 'decimal.js'
import { createActions, handleActions } from 'redux-actions'

// import { i18n } from '~/i18next.config'
import { preloadedState } from '../preloaded.state'


// const t = i18n.getFixedT(null, 'send-currency')

export type SendFromRadioButtonType = 'transparent' | 'private'

export type AddressDropdownItem = {
	address: string,
  name?: string,
	balance: Decimal | null,
  disabled?: boolean
}

export type SendCurrencyState = {
  fromAddress?: string,
	arePrivateTransactionsEnabled: boolean,
  addresses: AddressDropdownItem[],
  addressSearchString: string,
  isSubmitting: boolean,
  isConfirmationModalVisible: boolean
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

    SHOW_CONFIRMATION_MODAL: undefined,
    CLOSE_CONFIRMATION_MODAL: undefined,

    UPDATE_ADDRESS_SEARCH_STRING: searchString => ({ searchString }),
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
    ...state, isSubmitting: true
  }),
  [SendCurrencyActions.sendCurrencyOperationStarted]: state => ({
    ...state,
    isSubmitting: false
  }),
  [SendCurrencyActions.sendCurrencyOperationFailed]: state => ({
    ...state, isSubmitting: false
  }),

  [SendCurrencyActions.togglePrivateTransactions]: (state, action) => ({
    ...state,
    arePrivateTransactionsEnabled: action.payload.areEnabled
  }),
  [SendCurrencyActions.showConfirmationModal]: state => ({
    ...state,
    isConfirmationModalVisible: true,
  }),
  [SendCurrencyActions.closeConfirmationModal]: state => ({
    ...state,
    isConfirmationModalVisible: false,
  }),
  [SendCurrencyActions.updateAddressSearchString]: (state, action) => ({
    ...state,
    addressSearchString: action.payload.searchString
  }),
}, preloadedState)
