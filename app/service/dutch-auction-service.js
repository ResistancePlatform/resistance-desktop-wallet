// @flow
import { Decimal } from 'decimal.js'
import moment from 'moment'
import rp from 'request-promise-native'
import log from 'electron-log'

import { RESDEX } from '~/constants/resdex'

const apiUrl = 'https://lbt95atwl1.execute-api.us-east-1.amazonaws.com/api/v1/'

/**
 * ES6 singleton
 */
let instance = null


/**
 * @export
 * @class DutchAuctionService
 */
export class DutchAuctionService {
	/**
	 * @memberof DutchAuctionService
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

    this.get = (path, data) => this.query({ path, method: 'GET', data })
    this.post = (path, data) => this.query({ path, method: 'POST', data })

		return instance
	}

  setCredentials({userId, authToken}) {
    this.userId = userId
    this.authToken = authToken
  }

  async register(options) {
    return this.post('register', { ...options })
  }

  async getAuctionStatus() {
    const response = await this.get('auction/status')
    const { data } = response

    const fromWei = wei => Decimal(wei).dividedBy(RESDEX.weiDivider)
    const toDate = ts => moment.unix(ts).toDate()

    return {
      ...response,
      timestamp: toDate(response.timestamp),
      data: {
        ...response.data,
        initialPrice: fromWei(data.initialPrice),
        reservePrice: fromWei(data.reservePrice),
        startTime: toDate(data.startTime),
        amountCommitted: fromWei(data.weiCommitted),
      }
    }
  }

  async query({path, method, data, isAuthRequired}) {
    const uri = `${apiUrl}${path}`

    const options = {
      uri,
      method,
      body: data,
      json: true
    }

    log.debug(`Calling Dutch auction API ${method}`, uri, JSON.stringify(data))

    if (isAuthRequired) {
      if (!this.userId || !this.authToken) {
        throw new Error(`Missing credentials.`)
      }

      const auth = Buffer.from(`${this.userId}:${this.authToken}`).toString('base64')

      options.headers = {
        Authorization: `Basic ${auth}`,
      }
    }

    let response

    try {
      response = await rp(options)
    } catch(error) {
      throw new Error(error)
    }

    if (response.error) {
      throw new Error(response.error)
    }

    return response
  }
}
