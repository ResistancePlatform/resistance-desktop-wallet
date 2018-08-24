// @flow
import { tap, switchMap, map, mapTo } from 'rxjs/operators'
import { merge, of } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { TRANSACTION_FEE } from '../../../constants'
import { AppAction } from '../appAction'
import { SystemInfoActions } from '../system-info/system-info.reducer'
import { SendCashActions, SendCashState, checkPrivateTransactionRule } from './send-cash.reducer'
import { AddressBookRow } from '../address-book/address-book.reducer'
import { RpcService } from '../../../service/rpc-service'
import { AddressBookService } from '../../../service/address-book-service'


const resistanceCliService = new RpcService()
const addressBookService = new AddressBookService()

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
	} else if (sendCashState.amount.lessThanOrEqualTo(TRANSACTION_FEE)) {
		return '"AMOUNT" is required.'
	}

	return 'ok'
}


const sendCashEpic = (action$: ActionsObservable<AppAction>, state$) => action$.pipe(
	ofType(SendCashActions.sendCash),
	map(() => {
		const isAllowedToSend = allowToSend(state$.value.sendCash)
		if (isAllowedToSend !== 'ok') {
			return SendCashActions.sendCashFailure(isAllowedToSend)
		}

		const checkRuleResult = checkPrivateTransactionRule(state$.value.sendCash)
		if (checkRuleResult !== 'ok') {
			return SendCashActions.sendCashFailure(checkRuleResult)
		}

    // Lock local Resistance node and Tor from toggling
		return SystemInfoActions.newOperationTriggered()
	}),
	tap((action: AppAction) => {
		// Only fire real send if no error above
		if (action.type === SystemInfoActions.newOperationTriggered.toString()) {
			const state = state$.value.sendCash
			resistanceCliService.sendCash(state.fromAddress, state.toAddress, state.amount)
		}
	})
)

const sendCashOperationStartedEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
	ofType(SendCashActions.sendCashOperationStarted),
	tap(() => {
		toastr.info(`Send cash operation started.`)
	}),
	mapTo(SendCashActions.empty())
)

const sendCashFailureEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
	ofType(SendCashActions.sendCashFailure),
  tap((action: AppAction) => {
    toastr.error(`Unable to start send cash operation`, action.payload.errorMessage)
  }),
	mapTo(SendCashActions.empty())
)

const getAddressListEpic = (action$: ActionsObservable<AppAction>, state$) => action$.pipe(
	ofType(SendCashActions.getAddressList),
	switchMap(() => {
		const sendCashState = state$.value.sendCash
		return resistanceCliService.getWalletAddressAndBalance(true, !sendCashState.isPrivateTransactions)
	}),
	map(result => SendCashActions.getAddressListSuccess(result))
)

const checkAddressBookByNameEpic = (action$: ActionsObservable<AppAction>, state$) => action$.pipe(
	ofType(SendCashActions.checkAddressBookByName),
	switchMap(() => {
		const sendCashState = state$.value.sendCash
		if (sendCashState.toAddress.trim() === '') {
			return of(SendCashActions.empty())
		}

		const addressBookState = state$.value.addressBook
		const addressbookContent$ = addressBookState.addresses && addressBookState.addresses.length > 0 ?
			of(addressBookState.addresses) : addressBookService.loadAddressBook()

		return addressbookContent$.pipe(
			map((addressBookRows: AddressBookRow[]) => {
				if (!addressBookRows || addressBookRows.length <= 0) {
					return SendCashActions.empty()
				}

				const matchedAddressRow = addressBookRows.find(tempAddressRow => tempAddressRow.name.toLowerCase() === sendCashState.toAddress.trim().toLowerCase())
				return matchedAddressRow ? SendCashActions.updateToAddress(matchedAddressRow.address) : SendCashActions.empty()
			})
		)
	})
)

export const SendCashEpics = (action$, state$) => merge(
	sendCashEpic(action$, state$),
	sendCashOperationStartedEpic(action$, state$),
	sendCashFailureEpic(action$, state$),
	getAddressListEpic(action$, state$),
	checkAddressBookByNameEpic(action$, state$)
)
