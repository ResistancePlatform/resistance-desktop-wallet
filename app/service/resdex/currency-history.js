// @flow
import pMap from 'p-map'

import { RESDEX } from '~/constants/resdex'


const noPriceHistory = new Set()

/**
 * ES6 singleton
 */
let instance = null

/**
 * @export
 * @class CurrencyHistoryService
 */
export class CurrencyHistoryService {

	/**
	 * @memberof CurrencyHistoryService
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

		return instance
	}

  async fetch(symbol, resolution) {
    if (!symbol) {
      return
    }

    // We won't even bother to fetch if we know it won't work
    if (RESDEX.ignoreExternalPrice.has(symbol) || noPriceHistory.has(symbol)) {
      return
    }

    let json
    try {
      const response = await fetch(this::currencyHistoryUrl(symbol, resolution))
      json = await response.json()
    } catch (error) {
      console.error('Failed to get price history:', error)
    }

    if (!json || json.Data.length === 0) {
      noPriceHistory.add(symbol)
      return
    }

    const prices = json.Data.map(({time, close}) => ({
      time: time * 1000,
      value: close,
    }))

    return prices
  }

  async fetchAll(symbols, resolution) {
		const history = await pMap(symbols, symbol => this.fetch(symbol, resolution), {concurrency: 6});

    const result = symbols.reduce((accumulated, symbol, index) => ({
      ...accumulated,
      [symbol]: history[index]
    }), {})

    return result
  }

}

function currencyHistoryUrl(symbol, resolution) {
  const baseUrl = 'https://min-api.cryptocompare.com/data/'

  const getUrl = (type, limit, aggregate = 1) =>
  `${baseUrl}${type}?fsym=${symbol}&tsym=USD&aggregate=${aggregate}&limit=${limit}&extraParams=HyperDEX`

  const getUrlForMinutes = (minutes, aggregate) => getUrl('histominute', minutes, aggregate)
  const getUrlForHours = hours => getUrl('histohour', hours)
  const getUrlForDays = (days, aggregate) => getUrl('histoday', days, aggregate)

  switch (resolution) {
    case 'hour':
      return getUrlForMinutes(60)
    case 'day':
      return getUrlForMinutes(60 * 24, 10)
    case 'week':
      return getUrlForHours(24 * 7)
    case 'month':
      return getUrlForDays(30)
    case 'year':
      return getUrlForDays(365)
    case 'all':
      return getUrlForDays(100000, 7)
    default:
      throw new Error('Unsupported resolution')
  }
}
