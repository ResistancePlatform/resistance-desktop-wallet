// @flow
import { Observable, of } from 'rxjs'
import { map, tap, take, catchError } from 'rxjs/operators'
import { LoggerService, ConsoleTheme } from './logger-service'
import { AddressBookRow } from '../state/reducers/address-book/address-book.reducer'

const config = require('electron-settings')

const addressBookKey = 'addressbook'
const addressRowSortFunc = (a1, a2) => a1.name.localeCompare(a2.name)
const addressRowReduceFunc = (x, y) => x.findIndex(row => row.name === y.name && row.address === y.address) < 0 ? [...x, y] : x


/**
 * ES6 singleton
 */
let instance = null


/**
 * @export
 * @class AddressBookService
 */
export class AddressBookService {
	logger: LoggerService

	/**
	 * Creates an instance of AddressBookService.
	 * @memberof AddressBookService
	 */
	constructor() {
		if (!instance) { instance = this }

		this.logger = new LoggerService()
		return instance
	}

	/**
	 * @returns {Observable<AddressBookRow[]>}
	 * @memberof AddressBookService
	 */
	loadAddressBook(): Observable<AddressBookRow[]> {
		console.log(`config.get(addressBookKey, []): `, config.get(addressBookKey, []))
		return of(config.get(addressBookKey, [])).pipe(
			map((addresses) => addresses.sort(addressRowSortFunc)),
			tap(addresses => this.logger.debug(this, 'loadAddressBook', 'addresses: ', ConsoleTheme.testing, addresses)),
			take(1),
			catchError(error => {
				this.logger.error(this, 'loadAddressBook', 'Error happened: ', ConsoleTheme.error, error)
				return of([])
			})
		)
	}

	/**
	 * @param {(AddressBookRow[] | [])} [existsAddressRows]
	 * @param {AddressBookRow} newAddress
	 * @returns {Observable<AddressBookRow[]>}
	 * @memberof AddressBookService
	 */
	addAddress(existsAddressRows?: AddressBookRow[] | [], newAddress: AddressBookRow): Observable<AddressBookRow[]> {
		const tempAddressRows = existsAddressRows ? existsAddressRows : config.get(addressBookKey, [])
		// Remove the duplicate row
		const addressRowsToSave = [...tempAddressRows, newAddress]
			.reduce(addressRowReduceFunc, [])
			.sort(addressRowSortFunc)
		config.set(addressBookKey, addressRowsToSave)

		return of(addressRowsToSave).pipe(
			tap(addressRowsAfterSave => this.logger.debug(this, 'addAddress', 'addressRowsAfterSave: ', ConsoleTheme.testing, addressRowsAfterSave))
		)
	}

	/**
	 * @param {AddressBookRow[]} [existsAddressRows]
	 * @param {AddressBookRow} addressToRemove
	 * @returns {Observable<AddressBookRow[]>}
	 * @memberof AddressBookService
	 */
	removeAddress(existsAddressRows?: AddressBookRow[], addressToRemove: AddressBookRow): Observable<AddressBookRow[]> {
		const tempAddressRows = existsAddressRows ? existsAddressRows : config.get(addressBookKey, [])
		// Remove specified address and remove the duplicate row
		const addressRowsToSave = tempAddressRows
			.filter(tempAddress => tempAddress.name !== addressToRemove.name && tempAddress.address !== addressToRemove.address)
			.reduce(addressRowReduceFunc, [])
			.sort(addressRowSortFunc)
		config.set(addressBookKey, addressRowsToSave)

		return of(addressRowsToSave).pipe(
			tap(addressRowsAfterSave => this.logger.debug(this, 'removeAddress', 'addressRowsAfterSave: ', ConsoleTheme.testing, addressRowsAfterSave))
		)
	}

	/**
	 * @param {AddressBookRow[]} [existsAddressRows]
	 * @param {AddressBookRow} updatingAddress
	 * @param {AddressBookRow} newValueAddress
	 * @returns {Observable<AddressBookRow[]>}
	 * @memberof AddressBookService
	 */
	updateAddress(existsAddressRows?: AddressBookRow[], updatingAddress: AddressBookRow, newValueAddress: AddressBookRow): Observable<AddressBookRow[]> {
		const tempAddressRows = existsAddressRows ? existsAddressRows : config.get(addressBookKey, [])
		// Replace specified address and remove the duplicate row
		const addressRowsToSave = tempAddressRows
			.map(tempAddress => tempAddress.name === updatingAddress.name && tempAddress.address === updatingAddress.address ? newValueAddress : tempAddress)
			.reduce(addressRowReduceFunc, [])
			.sort(addressRowSortFunc)
		config.set(addressBookKey, addressRowsToSave)

		return of(addressRowsToSave).pipe(
			tap(addressRowsAfterSave => this.logger.debug(this, 'updateAddress', 'addressRowsAfterSave: ', ConsoleTheme.testing, addressRowsAfterSave))
		)
	}
}
