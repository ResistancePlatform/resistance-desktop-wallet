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
	balance: number,
	disabled?: boolean
}

export type ProcessingOperation = {
	operationId: string,
	status: ProcessingOperationStatus,
	percent: number,
	result: any
}

export type SendCashState = {
	isPrivateTransactions: boolean,
	lockIcon: 'Lock' | 'Unlock',
	lockTips: string,
	fromAddress: string,
	toAddress: string,
	inputTooltips: string,
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
	SEND_CASH_FAIL: (errorMessage: string, clearCurrentOperation: boolean) => ({ errorMessage, clearCurrentOperation }),
	UPDATE_SEND_OPERATION_STATUS: (progressingTransaction: ProcessingOperation) => progressingTransaction,
	UPDATE_DROPDOWN_MENU_VISIBILITY: (show: boolean) => show,
	GET_ADDRESS_LIST: (isPrivate: boolean) => isPrivate,
	GET_ADDRESS_LIST_SUCCESS: (addressList: AddressDropdownItem[]) => addressList,
	GET_ADDRESS_LIST_FAIL: undefined,
	PASTE_TO_ADDRESS_FROM_CLIPBOARD: undefined
}, { prefixe: `APP/SEND_CASH` })


const isPrivateAddress = (tempAddress: string) => tempAddress.startsWith('z')
const isTransparentAddress = (tempAddress: string) => tempAddress.startsWith('r')

/**
 * @param {*} tempState
 */
export const checkPrivateTransactionRule = (tempState: SendCashState) => {
	let checkResult = 'ok'

	// [Enabled] rules:
	// t_addr-- > z_addr SUCCESS
	// z_addr-- > z_addr SUCCESS
	// z_addr-- > t_addr SUCCESS
	// t_addr-- > t_addr SUCCESS
	if (tempState.isPrivateTransactions) return checkResult

	// [Disabled] rules:
	// t_addr --> z_addr ERROR
	// z_addr --> z_addr ERROR
	// z_addr --> t_addr ERROR
	// t_addr --> t_addr SUCCESS
	const transparentAddressDesc = `Transparent (R) address`
	const privateAddressDesc = `Private (Z) address`
	const prefixMessage = 'Sending cash '
	const postFixMessage = ' is forbitten when "Private Transactions" is off.'
	if (isTransparentAddress(tempState.fromAddress) && isPrivateAddress(tempState.toAddress)) {
		checkResult = `${prefixMessage}from a ${transparentAddressDesc} to a ${privateAddressDesc}${postFixMessage}`
	}
	else if (isPrivateAddress(tempState.fromAddress) && isPrivateAddress(tempState.toAddress)) {
		checkResult = `${prefixMessage}from a ${privateAddressDesc} to a ${privateAddressDesc}${postFixMessage}`
	}
	else if (isPrivateAddress(tempState.fromAddress) && isTransparentAddress(tempState.toAddress)) {
		checkResult = `${prefixMessage}from a ${privateAddressDesc} to a ${transparentAddressDesc}${postFixMessage}`
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
	/**
	 * t_addr --> z_addr -- Unlock. You are sending money from a Transparent (r) Address to a Private (Z) Address. This transaction will be partially shielded.
	 *
	 * z_addr --> z_addr -- Lock. You are sending money from a Private (Z) Address to a Private (Z) Address. This transaction will be fully shielded and invisible to all users.
	 *
	 * z_addr --> t_addr -- Unlock. You are sending money from a Private (Z) Address to a Transparent (r) Address. This transaction will be partially shielded.
	 *
	 * t_addr --> t_addr -- Unlock. You are sending money from a Transparent (r) Address to a Transparent (r) Address. This transaction will be fully transparent and visible to every user.
	 */
	const fromAddress = newState.fromAddress
	const toAddress = newState.toAddress
	let lockIcon = 'Unlock'
	let lockTips = `You are sending money from a Transparent (R) Address to a Transparent (R) Address. This transaction will be fully transparent and visible to every user.`

	if (isTransparentAddress(fromAddress) && isPrivateAddress(toAddress)) {
		lockIcon = `Unlock`
		lockTips = `You are sending money from a Transparent (R) Address to a Private (Z) Address. This transaction will be partially shielded.`
	} else if (isPrivateAddress(fromAddress) && isPrivateAddress(toAddress)) {
		lockIcon = `Lock`
		lockTips = `You are sending money from a Private (Z) Address to a Private (Z) Address. This transaction will be fully shielded and invisible to all users.`
	} else if (isPrivateAddress(fromAddress) && isTransparentAddress(toAddress)) {
		lockIcon = `Unlock`
		lockTips = `You are sending money from a Private (Z) Address to a Transparent (R) Address. This transaction will be partially shielded.`
	} else if (isTransparentAddress(fromAddress) && isTransparentAddress(toAddress)) {
		lockIcon = `Unlock`
		lockTips = `You are sending money from a Transparent (R) Address to a Transparent (R) Address. This transaction will be fully transparent and visible to every user.`
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
	// Reducer define format: 
	// [Action type string/action function name (.toString)]: (state, action) => state

	[SendCashActions.togglePrivateSend]: (state) => handleTogglePrivateTransaction(state),
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