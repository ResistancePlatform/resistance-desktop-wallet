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
	arePrivateTransactionsEnabled: boolean,
  addresses: AddressDropdownItem[],
  isSending: boolean
}

export const SendCurrencyActions = createActions(
  {
    EMPTY: undefined,

    GET_ADDRESSES: (searchString?: string) => ({ searchString }),
    GOT_ADDRESSES: (addresses: AddressDropdownItem[]) => ({ addresses }),

    TOGGLE_PRIVATE_TRANSACTIONS: areEnabled => ({ areEnabled }),

    SEND_CURRENCY: undefined,
  },
  {
    prefix: `APP/SEND_CURRENCY`
  }
)

export const SendCurrencyReducer = handleActions({
	[SendCurrencyActions.gotAddresses]: (state, action) => ({ ...state, addresses: action.payload.addresses }),

	[SendCurrencyActions.sendCurrency]: state => ({ ...state, isSending: true }),
	[SendCurrencyActions.sendCurrencyOperationStarted]: state => ({ ...state, isInputDisabled: false }),
	[SendCurrencyActions.sendCurrencyOperationFailed]: state => ({ ...state, isInputDisabled: false }),

  [SendCurrencyActions.togglePrivateTransactions]: (state, action) => ({
    ...state,
    arePrivateTransactionsEnabled: action.payload.areEnabled
  }),
}, preloadedState)
