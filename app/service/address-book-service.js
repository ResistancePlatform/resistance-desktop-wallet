// @flow
import { of, throwError } from 'rxjs'
import { AddressBookRecord } from '../state/reducers/address-book/address-book.reducer'

const config = require('electron-settings')

const addressBookConfigKey = 'addressBook'

/**
 * ES6 singleton
 */
let instance = null


/**
 * @export
 * @class AddressBookService
 */
export class AddressBookService {
  addressBook: AddressBookRecord[]

	/**
	 * Creates an instance of AddressBookService.
	 * @memberof AddressBookService
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

    instance.addressBook = []

		return instance
	}

	/**
	 * @memberof AddressBookService
	 */
	loadAddressBook() {
		return of(config.get(addressBookConfigKey, []))
	}

	/**
	 * @param {AddressBookRecord} addressRecord
	 * @memberof AddressBookService
	 */
	addAddress(addressRecord: AddressBookRecord) {
    const validated = this::validateAddressRecord(addressRecord)

    if (this.addressBook.filter(this::matchAddressRecord(validated)).length) {
      return throwError(`Address already exists in the database.`)
    }

    this.addressBook.push(validated)
		config.set(addressBookConfigKey, this.addressBook)

    return of(this.addressBook)
	}

	/**
	 * @param {string} name
	 * @memberof AddressBookService
	 */
	removeAddress(name: string) {
    this.addressBook = this.addressBook.filter(record => record.name !== name)
		config.set(addressBookConfigKey, this.addressBook)

    return of(this.addressBook)
	}

	/**
	 * @param {string]} originalName
	 * @param {AddressBookRecord} newAddressRecord
	 * @memberof AddressBookService
	 */
	updateAddress(originalName: string, newAddressRecord: AddressBookRecord) {
    const validated = this::validateAddressRecord(newAddressRecord)
    const index = this.addressBook.findIndex(this::matchAddressRecord(validated))

    if (index === -1) {
      return throwError(`Address not found in the database.`)
    }

    this.addressBook.splice(index, 1)
		config.set(addressBookConfigKey, this.addressBook)

    return of(this.addressBook)
	}
}

function validateAddressRecord(addressRecord: AddressBookRecord) {
  // TODO: replace with proper form validation #116
  return addressRecord
}

function matchAddressRecord(validated) {
  return record => (
    record.name === validated.name || record.address === validated.address
  )
}
