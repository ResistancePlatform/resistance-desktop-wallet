// @flow
import { clipboard } from 'electron'
import { map, switchMap, mergeMap, tap, mapTo, catchError } from 'rxjs/operators'
import { merge, of } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

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
  mergeMap(() => {
    const dialogState = state$.value.addressBook.newAddressDialog
    const newAddressRecord = {
      name: dialogState.name || '',
      address: dialogState.address || ''
    }
    return addressBookService.addAddress(newAddressRecord).pipe(
      mergeMap(result => of(AddressBookActions.gotAddressBook(result), AddressBookActions.newAddressDialog.close())),
      catchError(err => of(AddressBookActions.newAddressDialog.error(err.toString())))
    )
  })
)

const updateAddressRecordEpic = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(AddressBookActions.newAddressDialog.updateAddressRecord),
  mergeMap(() => {
    const dialogState = state$.value.addressBook.newAddressDialog
    const newAddressRecord = {
      name: dialogState.name || '',
      address: dialogState.address || ''
    }
    return addressBookService.updateAddress(dialogState.originalName, newAddressRecord).pipe(
      mergeMap(result => of(AddressBookActions.gotAddressBook(result), AddressBookActions.newAddressDialog.close())),
      catchError(err => of(AddressBookActions.newAddressDialog.error(err.toString())))
    )
  })
)

const copyAddressEpic = (action$: ActionsObservable<AppAction>) => action$.pipe(
	ofType(AddressBookActions.copyAddress),
	tap(action => clipboard.writeText(action.payload.address.address)),
	mapTo(AddressBookActions.empty())
)

const removeAddressRecordEpic = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(AddressBookActions.removeAddress),
  mergeMap(action => addressBookService.removeAddress(action.payload.address.name).pipe(
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
	addAddressRecordEpic(action$, state$),
	updateAddressRecordEpic(action$, state$),
	removeAddressRecordEpic(action$, state$),
	errorEpic(action$, state$),
)
