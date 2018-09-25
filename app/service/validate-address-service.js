// @flow
import bs58check from 'bs58check'
import * as Joi from 'joi'

import { i18n } from '~/i18next.config'

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
export default class ValidateAddressService {
	/**
	 * Creates an instance of ValidateAddressService.
   *
	 * @memberof ValidateAddressService
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

    instance.t = i18n.getFixedT(null, 'service')

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

	/**
   * Returns a Joi for Resistance address validation.
   *
	 * @memberof ValidateAddressService
	 */
  getJoi() {
    const newJoi = Joi.extend((joi) => ({
      base: joi.string(),
      name: 'resistanceAddress',
      language: {
        rZ: this.t(`has to begin with R- for a transparent address or Z- for a private one`),
        rLength: this.t(`R-addresses are 35 characters long, not {{length}}`, { length: `{{l}}` }),
        zLength: this.t(`Z-addresses are 95 characters long, not {{length}}`, { length: `{{l}}` }),
        valid: this.t(`is not a valid Resistance address`)
      },
      /* eslint-disable-next-line no-unused-vars */
      pre: (value, state, options) => value.replace(/\s+/g, ''),
      rules: [
        {
          name: 'rZ',
          validate: (params, value, state, options) => {
            if (!value.startsWith('r') && !value.startsWith('z')) {
              return joi.createError('resistanceAddress.rZ', {}, state, options)
            }
            return value
          }
        },
        {
          name: 'rLength',
          validate: (params, value, state, options) => {
            if (value.startsWith('r') && value.length !== 35) {
              return joi.createError('resistanceAddress.rLength', { l: value.length }, state, options)
            }
            return value
          }
        },
        {
          name: 'zLength',
          validate: (params, value, state, options) => {
            if (value.startsWith('z') && value.length !== 95) {
              return joi.createError('resistanceAddress.zLength', { l: value.length }, state, options)
            }
            return value
          }
        },
        {
          name: 'valid',
          validate: (params, value, state, options) => {
            if (!this.validate(value)) {
              return joi.createError('resistanceAddress.valid', {}, state, options)
            }
            return value
          }
        }
      ]
    }))

    return newJoi
  }
}
