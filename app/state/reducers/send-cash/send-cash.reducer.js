// @flow
import { AppAction } from '../appAction'

export type ProcessingOperationStatus = '' | 'queued' | 'executing' | 'cancelled' | 'failed' | 'success'

export type ProcessingOperation = {
	operationId: string,
	status: ProcessingOperationStatus,
	result: any
}

export type SendCashState = {
	isPrivateSendOn: boolean,
	operationProgressPercent: number,
	fromAddress: string,
	toAddress: string,
	amount: number,
	currentOperation: ProcessingOperation | null
}

const sendCashActionTypePrefix = 'SEND_CASH_ACTION'

export const SendCashActions = {
	EMPTY: `${sendCashActionTypePrefix}: EMPTY`,

	TOGGLE_PRIVATE_SEND: `${sendCashActionTypePrefix}: TOGGLE_PRIVATE_SEND`,
	UPDATE_FROM_ADDRESS: `${sendCashActionTypePrefix}: UPDATE_FROM_ADDRESS`,
	UPDATE_TO_ADDRESS: `${sendCashActionTypePrefix}: UPDATE_TO_ADDRESS`,
	UPDATE_AMOUNT: `${sendCashActionTypePrefix}: UPDATE_AMOUNT`,
	SHOW_USER_ERROR_MESSAGE: `${sendCashActionTypePrefix}: SHOW_USER_ERROR_MESSAGE`,
	SEND_CASH: `${sendCashActionTypePrefix}: SEND_CASH`,
	SEND_CASH_SUCCESS: `${sendCashActionTypePrefix}: SEND_CASH_SUCCESS`,
	SEND_CASH_FAIL: `${sendCashActionTypePrefix}: SEND_CASH_FAIL`,
	UPDATE_SEND_OPERATION_STATUS: `${sendCashActionTypePrefix}: UPDATE_SEND_OPERATION_STATUS`,

	togglePrivateSend: (): AppAction => ({ type: SendCashActions.TOGGLE_PRIVATE_SEND }),
	updateFromAddress: (address: string) => ({ type: SendCashActions.UPDATE_FROM_ADDRESS, payload: address }),
	updateToAddress: (address: string) => ({ type: SendCashActions.UPDATE_TO_ADDRESS, payload: address }),
	updateAmount: (amount: number) => ({ type: SendCashActions.UPDATE_AMOUNT, payload: amount }),
	sendCash: () => ({ type: SendCashActions.SEND_CASH }),
	sendCashSuccess: () => ({ type: SendCashActions.SEND_CASH_SUCCESS }),
	sendCashFail: (errorMessage: string, clearCurrentOperation: boolean) => ({ type: SendCashActions.SEND_CASH_FAIL, payload: { errorMessage, clearCurrentOperation } }),
	updateSendOperationStatus: (progressingTransaction: ProcessingOperation) => ({ type: SendCashActions.UPDATE_SEND_OPERATION_STATUS, payload: progressingTransaction }),

	showUserErrorMessage: (title: string, message: string) => ({ type: SendCashActions.SHOW_USER_ERROR_MESSAGE, payload: { title, message } }),

	empty: (): AppAction => ({ type: SendCashActions.EMPTY })
}

const initState: SendCashState = {
	isPrivateSendOn: false,
	operationProgressPercent: 0,
	fromAddress: '',
	toAddress: '',
	amount: 0,
	currentOperation: null
}

export const SendCashReducer = (state: SendCashState = initState, action: AppAction) => {

	/**
	 * @param {*} tempAddress 
	 */
	const isPrivateAddress = (tempAddress: string) => tempAddress === '' || tempAddress.startsWith('z')
	// const isTransparentAddress = (tempAddress: string) => tempAddress === '' || tempAddress.startsWith('k')

	/**
	 * @param {*} tempState 
	 */
	const handlePrivateSend = (tempState: SendCashState) => {
		const { isPrivateSendOn, fromAddress, toAddress } = tempState
		const newValue = !isPrivateSendOn

		if (newValue) {
			// need to check address
			return (isPrivateAddress(fromAddress) && isPrivateAddress(toAddress)) ? { ...state, isPrivateSendOn: newValue } : state
		}
		return { ...state, isPrivateSendOn: newValue }
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
			return { ...state, fromAddress: newAddress, isPrivateSendOn: newPrivateSendOnValue }
		}

		newPrivateSendOnValue = isPrivateAddress(newAddress) && isPrivateAddress(fromAddress)
		return { ...state, toAddress: newAddress, isPrivateSendOn: newPrivateSendOnValue }
	}

	switch (action.type) {

		case SendCashActions.TOGGLE_PRIVATE_SEND:
			return handlePrivateSend(state)

		case SendCashActions.UPDATE_FROM_ADDRESS:
			return handleAddressUpdate(state, action.payload, true)

		case SendCashActions.UPDATE_TO_ADDRESS:
			return handleAddressUpdate(state, action.payload, false)

		case SendCashActions.UPDATE_AMOUNT:
			return { ...state, amount: action.payload }

		case SendCashActions.SEND_CASH_SUCCESS:
			return { ...state, currentOperation: null }

		case SendCashActions.SEND_CASH_FAIL:
			return action.payload.clearCurrentOperation ? { ...state, currentOperation: null } : state

		case SendCashActions.UPDATE_SEND_OPERATION_STATUS:
			return { ...state, currentOperation: action.payload }

		default:
			return state
	}
}