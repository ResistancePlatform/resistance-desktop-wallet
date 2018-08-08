// @flow
import { map, tap, switchMap } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { AppAction } from '../appAction'
import { SendCashActions, SendCashState, checkPrivateTransactionRule } from './send-cash.reducer'
import { ResistanceCliService } from '../../../service/resistance-cli-service'
import { DialogService } from '../../../service/dialog-service'
import { LoggerService, ConsoleTheme } from '../../../service/logger-service'
import { ClipboardService } from '../../../service/clipboard-service'


const epicInstanceName = 'SendCashEpics'
const resistanceCliService = new ResistanceCliService()
const dialogService: DialogService = new DialogService()
const clipboardService = new ClipboardService()
const logger = new LoggerService()

const isPrevSendTransactionInProgress = (sendCashState: SendCashState) =>
	sendCashState.currentOperation !== null &&
	sendCashState.currentOperation !== undefined

const allowToSend = (sendCashState: SendCashState) => {
	if (
		sendCashState.fromAddress.trim() === '' ||
		sendCashState.toAddress.trim() === ''
	) {
		return '"FROM ADDRESS" or "DESTINATION ADDRESS" is required.'
	} else if (
		sendCashState.fromAddress.trim() === sendCashState.toAddress.trim()
	) {
		return '"FROM ADDRESS" or "DESTINATION ADDRESS" cannot be the same.'
	} else if (sendCashState.amount <= 0.0001) {
		return '"AMOUNT" is required.'
	}

	return 'ok'
}


const sendCashEpic = (action$: ActionsObservable<AppAction>, state$) => action$.pipe(
	ofType(SendCashActions.sendCash),
	tap((action: AppAction) => logger.debug(epicInstanceName, `sendCashEpic`, action.type, ConsoleTheme.testing)),
	map(() => {
		if (isPrevSendTransactionInProgress(state$.value.sendCash)) {
			return SendCashActions.sendCashFail(`The prev send operation is still in progress.`, )
		}

		const isAllowedToSend = allowToSend(state$.value.sendCash)
		if (isAllowedToSend !== 'ok') {
			return SendCashActions.sendCashFail(isAllowedToSend, false)
		}

		const checkRuleResult = checkPrivateTransactionRule(state$.value.sendCash)
		if (checkRuleResult !== 'ok') {
			return SendCashActions.sendCashFail(checkRuleResult, false)
		}

		return SendCashActions.empty()
	}),
	tap((action: AppAction) => {
		// Only fire real send if no error above
		if (action.type === SendCashActions.empty().type) {
			const state = state$.value.sendCash

			// Run in Async, `resistanceCliService` will update the state by firing one or more `updateSendOperationStatus()` action
			resistanceCliService.sendCash(state.fromAddress, state.toAddress, state.amount)
		}
	})
)

const sendCashSuccessEpic = (action$: ActionsObservable<AppAction>, state$) => action$.pipe(
	ofType(SendCashActions.sendCashSuccess),
	tap((action: AppAction) => logger.debug(epicInstanceName, `sendCashSuccessEpic`, action.type, ConsoleTheme.testing)),
	tap(() => {
		const sendCashState = state$.value.sendCash
		const message = `Successfully sent ${
			sendCashState.amount
			} RES from address:\n ${sendCashState.fromAddress} \n\n to address:\n ${
			sendCashState.toAddress
			}`
		dialogService.showMessage(`Cash Sent Successfully`, message)
	}),
	map(() => SendCashActions.empty())
)

const sendCashFailEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
	ofType(SendCashActions.sendCashFail),
	tap((action: AppAction) => logger.debug(epicInstanceName, `sendCashFailEpic`, action.type, ConsoleTheme.testing)),
	tap((action: AppAction) => dialogService.showError(`Cash Send Fail`, action.payload.errorMessage)),
	map(() => SendCashActions.empty())
)

const getAddressListEpic = (action$: ActionsObservable<AppAction>, state$) => action$.pipe(
	ofType(SendCashActions.getAddressList),
	tap((action: AppAction) => logger.debug(epicInstanceName, `getAddressListEpic`, action.type, ConsoleTheme.testing)),
	switchMap(() => {
		const sendCashState = state$.value.sendCash
		return resistanceCliService.getWalletAddressAndBalance(true, !sendCashState.isPrivateTransactions)
	}),
	map(result => SendCashActions.getAddressListSuccess(result))
)

const pasteToAddressFromClipboardEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
	ofType(SendCashActions.pasteToAddressFromClipboard),
	tap((action: AppAction) => logger.debug(epicInstanceName, `pasteToAddressFromClipboardEpic`, action.type, ConsoleTheme.testing)),
	map(() => SendCashActions.updateToAddress(clipboardService.getContent()))
)

export const SendCashEpics = (action$, state$) => merge(
	sendCashEpic(action$, state$),
	sendCashSuccessEpic(action$, state$),
	sendCashFailEpic(action$, state$),
	getAddressListEpic(action$, state$),
	pasteToAddressFromClipboardEpic(action$, state$)
)
