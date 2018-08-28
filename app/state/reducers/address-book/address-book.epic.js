// @flow
import { clipboard } from 'electron'
import { map, switchMap, mergeMap, tap } from 'rxjs/operators'
import { merge, of } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { AddressBookActions } from './address-book.reducer'
import { AddressBookService } from '../../../service/address-book-service'

const addressBookService = new AddressBookService()

const loadAddressBookEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(AddressBookActions.loadAddressBook),
	switchMap(() => addressBookService.loadAddressBook()),
	map(result => AddressBookActions.gotAddressBook(result))
)

const addAddressEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(AddressBookActions.addAddress),
	switchMap(() => {
		const addressBookState = state$.value.addressBook
		const newAddressDialogState = addressBookState.addressDialog
		const newAddress = { name: newAddressDialogState.name, address: newAddressDialogState.address }
		return addressBookService.addAddress(addressBookState.addresses, newAddress)
	}),
	mergeMap(result => of(AddressBookActions.gotAddressBook(result), AddressBookActions.updateNewAddressDialogVisibility(false)))
)

const updateAddressEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(AddressBookActions.updateAddress),
	switchMap(() => {
		const addressBookState = state$.value.addressBook
		const newAddressDialogState = addressBookState.addressDialog
		const udpatingAddress = addressBookState.updatingAddress
		const newValueAddress = { name: newAddressDialogState.name, address: newAddressDialogState.address }
		return addressBookService.updateAddress(addressBookState.addresses, udpatingAddress, newValueAddress)
	}),
	mergeMap(result => of(AddressBookActions.gotAddressBook(result), AddressBookActions.updateNewAddressDialogVisibility(false)))
)

const copyAddressEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
	ofType(AddressBookActions.copyAddress),
	tap(action => clipboard.writeText(action.payload.address)),
	map(() => AddressBookActions.empty())
)

const removeAddressEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(AddressBookActions.removeAddress),
	switchMap((action) => {
		const addressBookState = state$.value.addressBook
		const addressToRemove = action.payload
		return addressBookService.removeAddress(addressBookState.addresses, addressToRemove)
	}),
	mergeMap(result => of(AddressBookActions.gotAddressBook(result), AddressBookActions.updateNewAddressDialogVisibility(false)))
)

export const AddressBookEpics = (action$, state$) => merge(
	loadAddressBookEpic(action$, state$),
	addAddressEpic(action$, state$),
	copyAddressEpic(action$, state$),
	removeAddressEpic(action$, state$),
	updateAddressEpic(action$, state$)
)
