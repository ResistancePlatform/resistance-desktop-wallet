// @flow
import { createActions, handleActions } from 'redux-actions'
import { defaultAppState } from '../default-app-state'


export type ProcessingOperationStatus =
	| ''
	| 'queued'
	| 'executing'
	| 'cancelled'
	| 'failed'
	| 'success'

export type SendFromRadioButtonType = 'transparent' | 'private'

export type AddressDropdownItem = {
	address: string,
	balance: number
}

export type ProcessingOperation = {
	operationId: string,
	status: ProcessingOperationStatus,
	percent: number,
	result: any
}

export type SendCashState = {
	isPrivateSendOn: boolean,
	fromAddress: string,
	toAddress: string,
	amount: number,
	currentOperation: ProcessingOperation | null,
	showDropdownMenu: boolean,
	sendFromRadioButtonType: SendFromRadioButtonType,
	addressList: AddressDropdownItem[]
}

export const SendCashActions = createActions({
	// Action define format: 
	// [Action type string/Object key]: payload creator function

	EMPTY: undefined,
	TOGGLE_PRIVATE_SEND: undefined,
	UPDATE_FROM_ADDRESS: (address: string) => address,
	UPDATE_TO_ADDRESS: (address: string) => address,
	UPDATE_AMOUNT: (amount: number) => amount,
	SEND_CASH: undefined,
	SEND_CASH_SUCCESS: undefined,
	SEND_CASH_FAIL: (errorMessage: string, clearCurrentOperation: boolean) => ({errorMessage, clearCurrentOperation}),
	UPDATE_SEND_OPERATION_STATUS: (progressingTransaction: ProcessingOperation) => progressingTransaction,
	UPDATE_DROPDOWN_MENU_VISIBILITY: (show: boolean) => show,
	GET_ADDRESS_LIST: (isPrivate: boolean) => isPrivate,
	GET_ADDRESS_LIST_SUCCESS: (addressList: AddressDropdownItem[]) => addressList,
	GET_ADDRESS_LIST_FAIL: undefined,
	PASTE_TO_ADDRESS_FROM_CLIPBOARD: undefined
}, { prefixe: `APP/SEND_CASH` })


/**
 * @param {*} tempAddress
 */
const isPrivateAddress = (tempAddress: string) => tempAddress === '' || tempAddress.startsWith('z')

/**
 * @param {*} tempState
 */
const handlePrivateSend = (tempState: SendCashState) => {
	const { isPrivateSendOn, fromAddress, toAddress } = tempState
	const newValue = !isPrivateSendOn

	if (newValue) {
		// need to check address
		return isPrivateAddress(fromAddress) && isPrivateAddress(toAddress)
			? { ...tempState, isPrivateSendOn: newValue }
			: tempState
	}
	return { ...tempState, isPrivateSendOn: newValue }
}

/**
 * @param {*} tempState
 * @param {*} newAddress
 * @param {*} isUpdateFromAddress
 */
const handleAddressUpdate = (tempState: SendCashState, newAddress: string, isUpdateFromAddress: boolean) => {
	const { isPrivateSendOn, fromAddress, toAddress } = tempState
	let newPrivateSendOnValue = isPrivateSendOn

	if (isUpdateFromAddress) {
		newPrivateSendOnValue = isPrivateAddress(newAddress) && isPrivateAddress(toAddress)
		return {
			...tempState,
			fromAddress: newAddress,
			isPrivateSendOn: newPrivateSendOnValue
		}
	}

	newPrivateSendOnValue = isPrivateAddress(newAddress) && isPrivateAddress(fromAddress)
	return {
		...tempState,
		toAddress: newAddress,
		isPrivateSendOn: newPrivateSendOnValue
	}
}


export const SendCashReducer = handleActions({
	// Reducer define format: 
	// [Action type string/action function name (.toString)]: (state, action) => state

	[SendCashActions.togglePrivateSend]: (state) => handlePrivateSend(state),
	[SendCashActions.updateFromAddress]: (state, action) => handleAddressUpdate(state, action.payload, true),
	[SendCashActions.updateToAddress]: (state, action) => handleAddressUpdate(state, action.payload, false),
	[SendCashActions.updateAmount]: (state, action) => ({ ...state, amount: action.payload }),
	[SendCashActions.sendCashSuccess]: (state) => ({ ...state, currentOperation: null }),
	[SendCashActions.sendCashFail]: (state, action) => action.payload.clearCurrentOperation ? { ...state, currentOperation: null } : state,
	[SendCashActions.updateSendOperationStatus]: (state, action) => ({ ...state, currentOperation: action.payload }),
	[SendCashActions.updateDropdownMenuVisibility]: (state, action) => ({ ...state, showDropdownMenu: action.payload }),
	[SendCashActions.getAddressListSuccess]: (state, action) => ({ ...state, addressList: action.payload }),
	[SendCashActions.getAddressListFail]: (state) => ({ ...state, addressList: null })
}, defaultAppState.sendCash)