// @flow
import { clipboard } from 'electron'
import { map, switchMap, mergeMap, tap, mapTo, catchError } from 'rxjs/operators'
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

const addAddressRecordEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(AddressBookActions.newAddressDialog.addAddressRecord),
	switchMap(() => {
    const dialogState = state$.value.addressBook.newAddressDialog
    const newAddressRecord = {
      name: dialogState.name,
      address: dialogState.address
    }
		return addressBookService.addAddress(newAddressRecord)
	}),
  map(result => of(AddressBookActions.gotAddressBook(result), AddressBookActions.newAddressDialog.hide())),
  catchError(err => of(AddressBookActions.newAddressDialog.error(err)))
)

const updateAddressRecordEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(AddressBookActions.newAddressDialog.updateAddressRecord),
  mergeMap(() => addressBookService.updateAddressRecord(state$.value.addressBook).pipe(
    map(result => of(AddressBookActions.gotAddressBook(result), AddressBookActions.newAddressDialog.hide())),
    catchError(err => of(AddressBookActions.newAddressDialog.error(err)))
  ))
)

const copyAddressEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
	ofType(AddressBookActions.copyAddress),
	tap(action => clipboard.writeText(action.payload.address)),
	mapTo(AddressBookActions.empty())
)

const removeAddressRecordEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(AddressBookActions.newAddressDialog.removeAddressRecord),
  mergeMap(action => addressBookService.updateAddressRecord(action.payload.name).pipe(
    map(result => of(AddressBookActions.gotAddressBook(result), AddressBookActions.newAddressDialog.hide())),
    catchError(err => of(AddressBookActions.newAddressDialog.error(err)))
  ))
)

export const AddressBookEpics = (action$, state$) => merge(
	copyAddressEpic(action$, state$),
	loadAddressBookEpic(action$, state$),
	addAddressRecordEpic(action$, state$),
	updateAddressRecordEpic(action$, state$),
	removeAddressRecordEpic(action$, state$)
)
