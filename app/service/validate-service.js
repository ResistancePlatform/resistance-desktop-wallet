// @flow
import { bs58check } from 'bs58check'

/**
 * ES6 singleton
 */
let instance = null

/**
 * Validates Resistance addresses
 *
 * @export
 * @class ValidateService
 */
export class ValidateService {
	/**
	 * Creates an instance of ValidateService.
   *
	 * @memberof ValidateService
	 */
	constructor() {
		if (!instance) { instance = this }

		return instance
	}

  /**
   * Returns true if a valid address is given.
   *
   * @param {string} address
   * @memberof ValidateService
   * @returns {boolean}
   */
  validate(address: string): boolean {
    try {
      bs58check.decode(address)
    } catch {
      return false
    }

    if (address.startsWith('r')) {
      return address.length === 35
    } else if (address.startsWith('z')) {
      return address.length === 95
    }

    return false
  }
}
