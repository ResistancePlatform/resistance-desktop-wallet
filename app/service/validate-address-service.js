// @flow
import bs58check from 'bs58check'

/**
 * ES6 singleton
 */
let instance = null

const rAddrLeadingBytes = [0x1C0C, 0x1B97]
const zAddrLeadingBytes = [0x16B6, 0x16B2]

/**
 * Validates Resistance addresses
 *
 * @export
 * @class ValidateAddressService
 */
export class ValidateAddressService {
	/**
	 * Creates an instance of ValidateAddressService.
   *
	 * @memberof ValidateAddressService
	 */
	constructor() {
		if (!instance) { instance = this }

		return instance
	}

  /**
   * Returns true if a valid address is given.
   *
   * @param {string} address
   * @memberof ValidateAddressService
   * @returns {boolean}
   */
  validate(address: string): boolean {
    let isValid = false

    const getLeadingBytes = () => {
      try {
        const decoded = bs58check.decode(address).slice(0, 2).readInt16BE(0)
        return decoded
      } catch(err) {
        return 0x0000
      }
    }

    if (address.startsWith('r')) {
      isValid = address.length === 35 && rAddrLeadingBytes.includes(getLeadingBytes())
    } if (address.startsWith('z')) {
      isValid = address.length === 95 && zAddrLeadingBytes.includes(getLeadingBytes())
    }

    return isValid
  }
}
