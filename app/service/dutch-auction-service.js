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

const fromWei = wei => (
  wei !== undefined &&
  Decimal(wei).dividedBy(RESDEX.weiDivider)
)

// const fromSatoshi = satoshi => satoshi  !== undefined && Decimal(satoshi).dividedBy(RESDEX.satoshiDivider)
const toDate = ts => ts && moment(ts).toDate()

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

    log.debug(`Dutch Auction credentials:`, credentials)

    this.userId = credentials.userId
    this.accessToken = credentials.accessToken

    instance = this

		return instance
	}

  setCredentials(userId, accessToken) {
    this.userId = userId
    this.accessToken = accessToken
  }

  hasCredentials() {
    return this.userId !== null && this.accessToken !== null
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

    const result = {
      ...response,
      timestamp: toDate(response.timestamp),
      data: {
        ...response.data,

        // status: 'finished',

        // Default
        initialPrice: fromWei(data.initialPrice),
        priceInterval: fromWei(data.priceInterval),
        reservePrice: fromWei(data.reservePrice),
        startTime: toDate(data.startTime),
        ethCommitted: fromWei(data.weiCommitted),

        // Active
        currentPrice: fromWei(data.currentPrice),
        nextRoundTime: toDate(data.nextRoundTime),
        resSold: data.resSold !== undefined && Decimal(data.resSold),

        // Finished
        finishTime: toDate(data.finishTime),
        finalPrice: fromWei(data.finalPrice)
      }
    }

    log.debug(`Dutch auction status:`, result)
    return result
  }

  async getUserStatus() {
    const response = await this.query({
      path: 'user',
      method: 'GET',
      isAuthRequired: true
    })

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
      log.debug(`Dutch Auction auth headers:`, options.headers)
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
