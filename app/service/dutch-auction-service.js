// @flow
import config from 'electron-settings'
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

const fromWei = wei => Decimal(wei).dividedBy(RESDEX.weiDivider)
const toDate = ts => moment.unix(ts).toDate()


/**
 * @export
 * @class DutchAuctionService
 */
export class DutchAuctionService {
	/**
	 * @memberof DutchAuctionService
	 */
	constructor() {
    if (instance) {
      return instance
    }

    this.get = (path, data) => this.query({ path, method: 'GET', data })
    this.post = (path, data) => this.query({ path, method: 'POST', data })

    const credentials = config.get('dutchAuction.credentials', {userId: null, accessToken: null})

    this.userId = credentials.userId
    this.accessToken = credentials.accessToken

    instance = this

		return instance
	}

  setCredentials({userId, accessToken}) {
    this.userId = userId
    this.accessToken = accessToken
  }

  async register({tid, email, resAddress}) {
    return this.post('register', {
      tid,
      email,
      resAddress
    })
  }

  async getAuctionStatus() {
    const response = await this.get('auction/status')
    const { data } = response

    return {
      ...response,
      timestamp: toDate(response.timestamp),
      data: {
        ...response.data,
        initialPrice: fromWei(data.initialPrice),
        reservePrice: fromWei(data.reservePrice),
        startTime: toDate(data.startTime),
        ethCommitted: fromWei(data.weiCommitted),
      }
    }
  }

  async getUserStatus() {
    const response = await this.get('user')

    return {
      ethCommitted: fromWei(response.weiCommitted),
      ethAddress: response.ethAddress,
      auctionId: response.auctionId
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
      if (!this.userId || !this.accessToken) {
        throw new Error(`Missing credentials.`)
      }

      const auth = Buffer.from(`${this.userId}:${this.accessToken}`).toString('base64')

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
