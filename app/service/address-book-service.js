// @flow
import { of, throwError } from 'rxjs'
import { AddressBookRecord } from '../state/reducers/address-book/address-book.reducer'

const config = require('electron-settings')

const addressBookConfigKey = 'addressBook'
const addressNotFoundErrorMessage = `Address not found in the database.`

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
      instance.addressBook = []
    }

		return instance
	}

	/**
	 * @memberof AddressBookService
	 */
	loadAddressBook() {
    this.addressBook = config.get(addressBookConfigKey, [])
		return of(this.addressBook)
	}

	/**
	 * @param {AddressBookRecord} addressRecord
	 * @memberof AddressBookService
	 */
	addAddress(addressRecord: AddressBookRecord) {
    const validated = this::validateAddressRecord(addressRecord)
    const match = record => (
      record.name === validated.name || record.address === validated.address
    )

    if (this.addressBook.filter(match).length) {
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
    const index = this.addressBook.findIndex(record => record.name === name)

    if (index === -1) {
      return throwError(addressNotFoundErrorMessage)
    }

    this.addressBook.splice(index, 1)
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

    const index = this.addressBook.findIndex(record => record.name === originalName)

    if (index === -1) {
      return throwError(addressNotFoundErrorMessage)
    }

    this.addressBook[index] = validated
		config.set(addressBookConfigKey, this.addressBook)

    return of(this.addressBook)
	}
}

function validateAddressRecord(addressRecord: AddressBookRecord) {
  // TODO: replace with proper form validation #116
  return addressRecord
}
