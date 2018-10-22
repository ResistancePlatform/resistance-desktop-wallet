// @flow
import { Decimal } from 'decimal.js'
import crypto from 'crypto'
import rp from 'request-promise-native'
import log from 'electron-log'
import { remote } from 'electron'
import getPort from 'get-port'

import { getStore } from '~/store/configureStore'
import { translate } from '~/i18next.config'
import MarketmakerSocket from './marketmaker-socket'
import { getCurrency } from '~/utils/resdex'
import { ResDexLoginActions } from '~/reducers/resdex/login/reducer'

export const resDexUri = 'http://127.0.0.1:17445'

const t = translate('service')

class ResDexApiError extends Error {
  constructor(response) {
    super(response.error)
    this.response = response
  }
}

/**
 * ES6 singleton
 */
let instance = null

/**
 * @export
 * @class ResDexApiService
 */
export class ResDexApiService {
  socket = false
	useQueue = false
	currentQueueId = 0

	/**
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

	async enableSocket() {
		const port = await getPort()
		const {endpoint} = await this.query({method: 'getendpoint', port})
		const socket = new MarketmakerSocket(endpoint)
		await socket.connected
		this.socket = socket

		return this.socket
	}

  async listTransactions(coin: string, address: string) {
    const response = await this.query({
      method: 'listtransactions',
      coin,
      address
    })

    // TODO: check if it's possible to get rawtransaction for Electrum currencies
    if (response.length && response[0].tx_hash) {
      return []
    }

    log.debug('listTransactions', coin, response.slice(0, 1))

    const result = response.map(transaction => ({
      ...response,
      amount: Decimal(transaction.amount),
      fee: Decimal(transaction.fee),
    }))

    return result
  }

	async getFee(coin) {
		const response = await this.query({
			method: 'getfee',
			coin,
		})

		return Decimal(response.txfee)
	}

  getPortfolio() {
    return this.query({ method: 'portfolio' })
  }

  async enableCurrency(symbol: string) {
		const currency = getCurrency(symbol)

		if (!currency) {
      log.error(`Tried to enable unsupported currency:`, symbol)
      return
		}

		if (currency.electrumServers) {
			const queries = currency.electrumServers.map(server => this.query({
				method: 'electrum',
				coin: symbol,
				ipaddr: server.host,
				port: server.port,
			}))

			const responses = await Promise.all(queries)
			const success = responses.filter(response => response.result === 'success').length > 0

			if (!success) {
        log.error(`Could not connect to ${symbol} Electrum server`)
        throw new Error(t(`Could not connect to {{symbol}} Electrum server`, { symbol }))
			}

			return success
		}

		const response = await this.query({ method: 'enable', coin: symbol })
		return response.status === 'active'
  }

	async getOrderBook(base, rel) {
		const response = await this.query({
			method: 'orderbook',
			base,
			rel,
		})

		const formatOrders = orders => orders
			.filter(order => order.numutxos > 0)
			.map(order => ({
				address: order.address,
				depth: order.depth,
				price: Decimal(order.price),
				utxoCount: order.numutxos,
				averageVolume: Decimal(order.avevolume),
				maxVolume: Decimal(order.maxvolume),
				zCredits: order.zcredits,
			}))

		const formattedResponse = {
			baseCurrency: response.base,
			quoteCurrency: response.rel,
			asks: formatOrders(response.asks),
			bids: formatOrders(response.bids),
		}

		return formattedResponse
	}

	/**
	 * Creates an order.
   *
	 * @memberof ResDexApiService
	 */
  createMarketOrder(opts) {
    return this.query({
      method: opts.type,
      gtc: 1,
      duration: 240,
      base: opts.baseCurrency,
      rel: opts.quoteCurrency,
      basevolume: opts.amount.toNumber(),
      relvolume: opts.total.toNumber(),
      price: opts.price.toNumber(),
    })
  }

	/**
	 * Creates an instance of ResDexApiService.
   *
	 * @memberof ResDexApiService
	 */
  query(data: object) {
    const token = remote.getGlobal('resDex').apiToken

    log.debug(`Calling ResDEX API method ${data.method}`, JSON.stringify(data))

    if (!token) {
      getStore().dispatch(ResDexLoginActions.showDialog())
      return Promise.reject(new Error(t(`Authentication failed`)))
    }

    const options = {
      uri: resDexUri,
      method: 'POST',
      body: {
        ...data,
        userpass: token,
        queueid: 0,
        needjson: 1,
      },
      json: true
    }

    return rp(options).then(response => {
      if (response.error) {
        throw new ResDexApiError(response)
      }
      return response
    })
  }

}
