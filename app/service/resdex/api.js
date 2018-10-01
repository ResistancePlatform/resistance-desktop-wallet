// @flow
import crypto from 'crypto'
import rp from 'request-promise-native'
import { remote } from 'electron'

import { translate } from '~/i18next.config'
import { OSService } from '~/service/os-service'
import { ResDexLoginActions } from '~/reducers/resdex/login/reducer'

const resDexUri = 'http://127.0.0.1:17445'

const t = translate('service')
const os = new OSService()

/**
 * ES6 singleton
 */
let instance = null

/**
 * @export
 * @class ResDexApiService
 */
export class ResDexApiService {
	/**
	 * Creates an instance of ResDexApiService.
   *
	 * @memberof ResDexApiService
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

		return instance
	}

  setToken(seedPhrase: string) {
    const token = crypto.createHash('sha256').update(seedPhrase).digest('hex')
    remote.getGlobal('resDex').apiToken = token
  }

  getPortfolio() {
    return this.query({ method: 'portfolio' })
  }

	/**
	 * Creates an instance of ResDexApiService.
   *
	 * @memberof ResDexApiService
	 */
  query(data: object) {
    const token = remote.getGlobal('resDex').apiToken

    if (!token) {
      os.dispatchAction(ResDexLoginActions.showDialog())
      return Promise.reject(new Error(t(`Authentication failed`)))
    }

    const options = {
      uri: resDexUri,
      method: 'POST',
      body: {
        ...data,
        userpass: token,
      },
      json: true
    }

    return rp(options).then(response => {
      if (response.result !== 'success') {
        throw new Error(response.error)
      }
      return response
    })
  }

}

