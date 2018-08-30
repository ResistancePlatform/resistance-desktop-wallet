// @flow
import { clipboard } from 'electron'
import { map, switchMap, mergeMap, tap, mapTo, catchError } from 'rxjs/operators'
import { merge, of } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { AddressBookActions } from './address-book.reducer'
import { AddressBookService } from '../../../service/address-book-service'

const addressBook = new AddressBookService()

const loadAddressBookEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(AddressBookActions.loadAddressBook),
	switchMap(() => addressBook.loadAddressBook()),
	map(result => AddressBookActions.gotAddressBook(result))
)

const addAddressEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(AddressBookActions.newAddressDialog.addAddress),
  mergeMap(() => {
    const newAddressRecord = state$.value.addressBook.newAddressDialog.fields
    return addressBook.addAddress(newAddressRecord).pipe(
      mergeMap(result => of(AddressBookActions.gotAddressBook(result), AddressBookActions.newAddressDialog.close())),
      catchError(err => of(AddressBookActions.newAddressDialog.error(err.toString())))
    )
  })
)

const updateAddressEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(AddressBookActions.newAddressDialog.updateAddress),
  mergeMap(() => {
    const dialogState = state$.value.addressBook.newAddressDialog
    return addressBook.updateAddress(dialogState.originalName, dialogState.fields).pipe(
      mergeMap(result => of(AddressBookActions.gotAddressBook(result), AddressBookActions.newAddressDialog.close())),
      catchError(err => of(AddressBookActions.newAddressDialog.error(err.toString())))
    )
  })
)

const copyAddressEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
	ofType(AddressBookActions.copyAddress),
	tap(action => clipboard.writeText(action.payload.record.address)),
	mapTo(AddressBookActions.empty())
)

const removeAddressEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(AddressBookActions.removeAddress),
  mergeMap(action => addressBook.removeAddress(action.payload.record.name).pipe(
    map(result => AddressBookActions.gotAddressBook(result)),
    catchError(err => of(AddressBookActions.newAddressDialog.error(err.toString())))
  ))
)

const errorEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(AddressBookActions.newAddressDialog.error),
  tap(action => { toastr.error(action.payload.errorMessage) }),
  mapTo(AddressBookActions.empty())
)

export const AddressBookEpics = (action$, state$) => merge(
	copyAddressEpic(action$, state$),
	loadAddressBookEpic(action$, state$),
	addAddressEpic(action$, state$),
	updateAddressEpic(action$, state$),
	removeAddressEpic(action$, state$),
	errorEpic(action$, state$),
)
