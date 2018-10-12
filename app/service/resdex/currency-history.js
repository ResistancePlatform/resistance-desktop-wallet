// @flow
import { Decimal } from 'decimal.js'
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

  async fetch(symbols) {
    const history = await pMap(
      RESDEX.currencyHistoryResolutions,
      resolution => this::fetchSymbols(symbols, resolution), {concurrency: 2}
    )

    const result = RESDEX.currencyHistoryResolutions.reduce((accumulated, resolution, index) => ({
      ...accumulated,
      [resolution]: history[index]
    }), {})

    return result
  }

}

async function fetchSymbols(symbols, resolution) {
  const history = await pMap(symbols, symbol => this::fetchSymbol(symbol, resolution), {concurrency: 3})

  const result = symbols.reduce((accumulated, symbol, index) => ({
    ...accumulated,
    [symbol]: history[index]
  }), {})

  return result
}

async function fetchSymbol(symbol, resolution) {
  if (!symbol) {
    return
  }

  let querySymbol = symbol

  if (['HODLC', 'RES'].includes(symbol)) {
    querySymbol = 'HODL'
  }

  // We won't even bother to fetch if we know it won't work
  if (RESDEX.ignoreExternalPrice.has(symbol) || noPriceHistory.has(querySymbol)) {
    return
  }

  let json
  try {
    const response = await fetch(this::currencyHistoryUrl(querySymbol, resolution))
    json = await response.json()
  } catch (error) {
    console.error('Failed to get price history:', error)
  }

  if (!json || json.Data.length === 0) {
    noPriceHistory.add(querySymbol)
    return
  }

  const prices = json.Data.map(({time, close}) => ({
    time: time * 1000,
    value: Decimal(symbol === 'RES' ? close * 1000 : close),
  }))

  return prices
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