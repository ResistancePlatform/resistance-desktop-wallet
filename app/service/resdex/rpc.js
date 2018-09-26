// @flow
import rp from 'request-promise-native'
import { remote } from 'electron'

const resDexUri = 'http://127.0.0.1:17445'

// import { translate } from '~/i18next.config'
// const t = translate('service')

/**
 * ES6 singleton
 */
let instance = null

/**
 * @export
 * @class ResDexRpcService
 */
export class ResDexRpcService {
	/**
	 * Creates an instance of ResDexRpcService.
   *
	 * @memberof ResDexRpcService
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

		return instance
	}

  login(password: string) {
    return this.query({
      method: 'passphrase',
      passphrase: password,
      gui: 'nogui'
    }).then()
  }

	/**
	 * Creates an instance of ResDexRpcService.
   *
	 * @memberof ResDexRpcService
	 */
  query(data: object, isPasswordRequired: boolean = true) {
    const options = {
      ...params,
      uri: resDexUri,
      method: 'POST',
      data
    }

    return rp(options)
  }

}

