// @flow
import { Decimal } from 'decimal.js'
import moment from 'moment'
import rp from 'request-promise-native'

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
  t: any

	/**
	 * @memberof DutchAuctionService
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

    this.get = (method, data) => this.query(method, 'GET', data)
    this.post = (method, data) => this.query(method, 'POST', data)

		return instance
	}

  async register(options) {
    return this.post('register', {
      ...options
    })
  }

  async status() {
    const response = await this.get('status', {})
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
        priceInterval: fromWei(data.priceInterval),
        amountCommitted: fromWei(data.weiCommitted),
      }
    }
  }

  query(method, httpMethod, data) {
    const uri = `${apiUrl}${method}`

    const options = {
      uri,
      method: 'POST',
      body: {
        ...data,
      },
      json: true
    }

    return rp(options)
      .then(response => {
        if (response.error) {
          throw new Error(response.error)
        }
        return response
      })
      .catch(error => {
          throw new Error(error)
      })
  }
}
