// @flow
import { of } from 'rxjs'
import { AddressBookRecords, AddressBookRecord } from '../state/reducers/address-book/address-book.reducer'

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
  addressBook: AddressBookRecords

	/**
	 * Creates an instance of AddressBookService.
	 * @memberof AddressBookService
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

    instance.addressBook = {}

		return instance
	}

	/**
	 * @memberof AddressBookService
	 */
	loadAddressBook() {
		return of(config.get(addressBookConfigKey, {}))
	}

	/**
	 * @param {AddressBookRecord} addressRecord
	 * @memberof AddressBookService
	 */
	addAddress(addressRecord: AddressBookRecord) {
    const addresses = Object.values(this.addressBook)

    const validated = this::validateAddressRecord(addressRecord)

    if (this.addressBook[validated.name] || addresses.includes(validated.address)) {
      throw Error(`Address already exists in the database.`)
    }

    this.addressBook[validated.name] = validated
		config.set(addressBookConfigKey, this.addressBook)

    return of(this.addressBook)
	}

	/**
	 * @param {string} name
	 * @memberof AddressBookService
	 */
	removeAddress(name: string) {
    delete this.addressBook[name]
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
    this.addressBook[originalName] = validated
		config.set(addressBookConfigKey, this.addressBook)

    return of(this.addressBook)
	}
}

function validateAddressRecord(addressRecord: AddressBookRecord) {
  // TODO: replace with proper form validation #116
  return addressRecord
}
