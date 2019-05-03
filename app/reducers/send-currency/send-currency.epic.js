// @flow
import { switchMap, map } from 'rxjs/operators'
import { Decimal } from 'decimal.js'
import { merge, of } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { i18n } from '~/i18next.config'
import { RoundedFormActions } from '~/reducers/rounded-form/rounded-form.reducer'
import { Action } from '../types'
import { SystemInfoActions } from '../system-info/system-info.reducer'
import { SendCurrencyActions } from './send-currency.reducer'
import { AddressBookRecord } from '../address-book/address-book.reducer'
import { RpcService } from '~/service/rpc-service'
import { AddressBookService } from '~/service/address-book-service'


const t = i18n.getFixedT(null, 'send-currency')
const rpc = new RpcService()
const addressBook = new AddressBookService()

const updateFromAddressEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SendCurrencyActions.updateFromAddress),
  map(action => (
    RoundedFormActions.updateField('sendCurrency', 'fromAddress', action.payload.address)
  ))
)

const sendCurrencyEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SendCurrencyActions.sendCurrency),
	map(() => {
    const {
      fromAddress,
      toAddress,
      amount
    } = state$.value.roundedForm.sendCurrency.fields

    rpc.sendCurrency(fromAddress, toAddress, Decimal(amount))

    // Lock local Resistance node and Tor from toggling
		return SystemInfoActions.newOperationTriggered()
	})
)

const sendCurrencyOperationStartedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SendCurrencyActions.sendCurrencyOperationStarted),
  map(() => {
		toastr.info(t(`Send currency operation started.`))
    return SendCurrencyActions.empty()
  })
)

const sendCurrencyOperationFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(SendCurrencyActions.sendCurrencyOperationFailed),
  map((action: Action) => {
    toastr.error(t(`Unable to start send currency operation`), action.payload.errorMessage)
    return SendCurrencyActions.empty()
  }),
)

const getAddressesEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(SendCurrencyActions.getAddresses),
	switchMap(() => {
		const sendCurrencyState = state$.value.sendCurrency
		return rpc.getWalletAddressAndBalance(true, !sendCurrencyState.arePrivateTransactionsEnabled)
	}),
	map(addresses => SendCurrencyActions.gotAddresses(addresses))
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
			of(addressBookState.addresses) : addressBook.loadAddressBook()

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
  updateFromAddressEpic(action$, state$),
	sendCurrencyEpic(action$, state$),
	sendCurrencyOperationStartedEpic(action$, state$),
	sendCurrencyOperationFailedEpic(action$, state$),
	getAddressesEpic(action$, state$),
	checkAddressBookByNameEpic(action$, state$)
)
