// @flow
import { tap, switchMap, map, mapTo } from 'rxjs/operators'
import { merge, of } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { DECIMAL } from '~/constants/decimal'
import { i18n } from '~/i18next.config'
import { Action } from '../types'
import { SystemInfoActions } from '../system-info/system-info.reducer'
import { SendCurrencyActions, SendCurrencyState, checkPrivateTransactionRule } from './send-currency.reducer'
import { AddressBookRecord } from '../address-book/address-book.reducer'
import { RpcService } from '~/service/rpc-service'
import { AddressBookService } from '~/service/address-book-service'


const t = i18n.getFixedT(null, 'send-currency')
const rpcService = new RpcService()
const addressBookService = new AddressBookService()

const allowToSend = (sendCurrencyState: SendCurrencyState) => {
	if (
		sendCurrencyState.fromAddress.trim() === '' ||
		sendCurrencyState.toAddress.trim() === ''
	) {
		return t('"FROM ADDRESS" or "DESTINATION ADDRESS" is required.')
  }

  if (
		sendCurrencyState.fromAddress.trim() === sendCurrencyState.toAddress.trim()
	) {
		return t(`"FROM ADDRESS" or "DESTINATION ADDRESS" cannot be the same.`)
  }

  if (sendCurrencyState.amount.lessThanOrEqualTo(DECIMAL.transactionFee)) {
		return t(`"AMOUNT" is required.`)
	}

	return 'ok'
}


const sendCurrencyEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SendCurrencyActions.sendCurrency),
	map(() => {
		const isAllowedToSend = allowToSend(state$.value.sendCurrency)
		if (isAllowedToSend !== 'ok') {
			return SendCurrencyActions.sendCurrencyFailure(isAllowedToSend)
		}

		const checkRuleResult = checkPrivateTransactionRule(state$.value.sendCurrency)
		if (checkRuleResult !== 'ok') {
			return SendCurrencyActions.sendCurrencyFailure(checkRuleResult)
		}

    // Lock local Resistance node and Tor from toggling
		return SystemInfoActions.newOperationTriggered()
	}),
	tap((action: Action) => {
		// Only fire real send if no error above
		if (action.type === SystemInfoActions.newOperationTriggered.toString()) {
			const state = state$.value.sendCurrency
			rpcService.sendCurrency(state.fromAddress, state.toAddress, state.amount)
		}
	})
)

const sendCurrencyOperationStartedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SendCurrencyActions.sendCurrencyOperationStarted),
	tap(() => {
		toastr.info(t(`Send currency operation started.`))
	}),
	mapTo(SendCurrencyActions.empty())
)

const sendCurrencyFailureEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SendCurrencyActions.sendCurrencyFailure),
  tap((action: Action) => {
    toastr.error(t(`Unable to start send currency operation`), action.payload.errorMessage)
  }),
	mapTo(SendCurrencyActions.empty())
)

const getAddressListEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SendCurrencyActions.getAddressList),
	switchMap(() => {
		const sendCurrencyState = state$.value.sendCurrency
		return rpcService.getWalletAddressAndBalance(true, !sendCurrencyState.arePrivateTransactionsEnabled)
	}),
	map(result => SendCurrencyActions.getAddressListSuccess(result))
)

const checkAddressBookByNameEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SendCurrencyActions.checkAddressBookByName),
	switchMap(() => {
		const sendCurrencyState = state$.value.sendCurrency
		if (sendCurrencyState.toAddress.trim() === '') {
			return of(SendCurrencyActions.empty())
		}

		const addressBookState = state$.value.addressBook
		const addressbookContent$ = addressBookState.addresses && addressBookState.addresses.length > 0 ?
			of(addressBookState.addresses) : addressBookService.loadAddressBook()

		return addressbookContent$.pipe(
			map((addressBookRows: AddressBookRecord[]) => {
				if (!addressBookRows || addressBookRows.length <= 0) {
					return SendCurrencyActions.empty()
				}

				const matchedAddressRow = addressBookRows.find(tempAddressRow => tempAddressRow.name.toLowerCase() === sendCurrencyState.toAddress.trim().toLowerCase())
				return matchedAddressRow ? SendCurrencyActions.updateToAddress(matchedAddressRow.address) : SendCurrencyActions.empty()
			})
		)
	})
)

export const SendCurrencyEpics = (action$, state$) => merge(
	sendCurrencyEpic(action$, state$),
	sendCurrencyOperationStartedEpic(action$, state$),
	sendCurrencyFailureEpic(action$, state$),
	getAddressListEpic(action$, state$),
	checkAddressBookByNameEpic(action$, state$)
)
