// @flow
import { Decimal } from 'decimal.js'
import { createActions, handleActions } from 'redux-actions'

import { i18n } from '~/i18n/i18next.config'
import { preloadedState } from '../preloaded.state'


const t = i18n.getFixedT(null, 'send-cash')

export type SendFromRadioButtonType = 'transparent' | 'private'

export type AddressDropdownItem = {
	address: string,
	balance: Decimal | null,
	disabled?: boolean
}

export type SendCashState = {
	isPrivateTransactions: boolean,
	lockIcon: 'Lock' | 'Unlock',
	lockTips: string | null,
	fromAddress: string,
	toAddress: string,
	inputTooltips: string,
	amount: Decimal,
	showDropdownMenu: boolean,
	sendFromRadioButtonType: SendFromRadioButtonType,
  addressList: AddressDropdownItem[],
  isInputDisabled: boolean
}

export const SendCashActions = createActions(
  {
    EMPTY: undefined,
    TOGGLE_PRIVATE_SEND: undefined,
    UPDATE_FROM_ADDRESS: (address: string) => address,
    UPDATE_TO_ADDRESS: (address: string) => address,
    UPDATE_AMOUNT: (amount: Decimal) => amount,
    SEND_CASH: undefined,
    SEND_CASH_OPERATION_STARTED: (operationId: string) => ({ operationId }),
    SEND_CASH_FAILURE: (errorMessage: string) => ({ errorMessage }),
    UPDATE_DROPDOWN_MENU_VISIBILITY: (show: boolean) => show,
    GET_ADDRESS_LIST: (isPrivate: boolean) => isPrivate,
    GET_ADDRESS_LIST_SUCCESS: (addressList: AddressDropdownItem[]) => addressList,
    GET_ADDRESS_LIST_FAIL: undefined,
    PASTE_TO_ADDRESS_FROM_CLIPBOARD: undefined,
    CHECK_ADDRESS_BOOK_BY_NAME: undefined
  },
  {
    prefix: `APP/SEND_CASH`
  }
)


const isPrivateAddress = (tempAddress: string) => tempAddress.startsWith('z')
const isTransparentAddress = (tempAddress: string) => tempAddress.startsWith('r')

/**
 * @param {*} tempState
 */
export const checkPrivateTransactionRule = (tempState: SendCashState) => {
	let checkResult = 'ok'

  if (tempState.isPrivateTransactions) {
    return checkResult
  }

	if (isTransparentAddress(tempState.fromAddress) && isPrivateAddress(tempState.toAddress)) {
    checkResult = t(`Sending cash from a transparent (R) address to a private (Z) address is forbidden when "Private Transactions" are disabled.`)
	}
	else if (isPrivateAddress(tempState.fromAddress) && isPrivateAddress(tempState.toAddress)) {
    checkResult = t(`Sending cash from a private (Z) address to a private (Z) address is forbidden when "Private Transactions" are disabled.`)
	}
	else if (isPrivateAddress(tempState.fromAddress) && isTransparentAddress(tempState.toAddress)) {
    checkResult = t(`Sending cash from a private (Z) address to a transparent (R) address is forbidden when "Private Transactions" are disabled.`)
	}

	return checkResult
}

/**
 * @param {*} tempState
 * @param {*} newAddress
 * @param {*} isUpdateFromAddress
 */
const handleAddressUpdate = (tempState: SendCashState, newAddress: string, isUpdateFromAddress: boolean) => {
	const newState = isUpdateFromAddress ? ({ ...tempState, fromAddress: newAddress }) : ({ ...tempState, toAddress: newAddress })

	// We should use the "next state" to run  the `checkPrivateTransactionRule` !!!
	const tempCheckResult = checkPrivateTransactionRule(newState)
	const newInputTooltips = tempCheckResult === 'ok' ? '' : tempCheckResult

	// The new `lockIcon` and `lockTips`
	const { fromAddress, toAddress } = newState

	let lockIcon = 'Unlock'
	let lockTips = t('tip-r-to-r')

	if (isTransparentAddress(fromAddress) && isPrivateAddress(toAddress)) {
		lockIcon = `Unlock`
		lockTips = t('tip-r-to-z')
	} else if (isPrivateAddress(fromAddress) && isPrivateAddress(toAddress)) {
		lockIcon = `Lock`
		lockTips = t('tip-z-to-z')
	} else if (isPrivateAddress(fromAddress) && isTransparentAddress(toAddress)) {
		lockIcon = `Unlock`
		lockTips = t('tip-z-to-r')
	} else if (isTransparentAddress(fromAddress) && isTransparentAddress(toAddress)) {
		lockIcon = `Unlock`
		lockTips = t('tip-r-to-r')
	}

	return ({ ...newState, inputTooltips: newInputTooltips, lockIcon, lockTips })
}

/**
 * @param {*} tempState
 */
const handleTogglePrivateTransaction = (tempState: SendCashState) => {
	const newState = ({ ...tempState, isPrivateTransactions: !tempState.isPrivateTransactions })

	// We should use the "next state" to run  the `checkPrivateTransactionRule` !!!
	const tempCheckResult = checkPrivateTransactionRule(newState)
	const newInputTooltips = tempCheckResult === 'ok' ? '' : tempCheckResult

	return ({ ...newState, inputTooltips: newInputTooltips })
}


export const SendCashReducer = handleActions({
	[SendCashActions.sendCash]: (state) => ({ ...state, isInputDisabled: true }),
	[SendCashActions.sendCashOperationStarted]: (state) => ({ ...state, isInputDisabled: false }),
	[SendCashActions.sendCashFailure]: (state) => ({ ...state, isInputDisabled: false }),

	[SendCashActions.togglePrivateSend]: (state) => handleTogglePrivateTransaction(state),

	[SendCashActions.updateFromAddress]: (state, action) => handleAddressUpdate(state, action.payload, true),
	[SendCashActions.updateToAddress]: (state, action) => handleAddressUpdate(state, action.payload, false),
	[SendCashActions.updateAmount]: (state, action) => ({ ...state, amount: action.payload }),
	[SendCashActions.updateDropdownMenuVisibility]: (state, action) => ({ ...state, showDropdownMenu: action.payload }),

	[SendCashActions.getAddressListSuccess]: (state, action) => ({ ...state, addressList: action.payload }),
	[SendCashActions.getAddressListFail]: (state) => ({ ...state, addressList: null })
}, preloadedState.sendCash)
