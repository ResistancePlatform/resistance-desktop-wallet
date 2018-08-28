// @flow
import { map, switchMap, mergeMap } from 'rxjs/operators'
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
		const newAddressDialogState = addressBookState.newAddressDialog
		const newAddress = { name: newAddressDialogState.name, address: newAddressDialogState.address }
		return addressBookService.addAddress(addressBookState.addresses, newAddress)
	}),
	mergeMap(result => of(AddressBookActions.gotAddressBook(result), AddressBookActions.updateNewAddressDialogVisibility(false)))

)

export const AddressBookEpics = (action$, state$) => merge(
	loadAddressBookEpic(action$, state$),
	addAddressEpic(action$, state$)
)
