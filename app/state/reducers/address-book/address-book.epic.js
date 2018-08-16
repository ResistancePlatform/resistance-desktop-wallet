// @flow
import { map, switchMap, mergeMap } from 'rxjs/operators'
import { merge, of } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { AddressBookActions } from './address-book.reducer'
import { AddressBookService } from '../../../service/address-book-service'
import { ClipboardService } from '../../../service/clipboard-service'

const addressBookService = new AddressBookService()
const clipboardService = new ClipboardService()

const loadAddressBookEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(AddressBookActions.loadAddressBook),
	switchMap(() => addressBookService.loadAddressBook()),
	map(result => AddressBookActions.gotAddressBook(result))
)

const pasteAddressFromClipboardEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
	ofType(AddressBookActions.pasteAddressFromClipboard),
	map(() => AddressBookActions.updateNewAddressDialogAddress(clipboardService.getContent()))
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
	pasteAddressFromClipboardEpic(action$, state$),
	addAddressEpic(action$, state$)
)
