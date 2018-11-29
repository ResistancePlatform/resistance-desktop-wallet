// @flow
import { Decimal } from 'decimal.js'
import crypto from 'crypto'
import rp from 'request-promise-native'
import log from 'electron-log'
import { remote } from 'electron'
import getPort from 'get-port'
import pMap from 'p-map'

import { getStore } from '~/store/configureStore'
import { translate } from '~/i18next.config'
import MarketmakerSocket from './marketmaker-socket'
import { getCurrency } from '~/utils/resdex'
import { ResDexLoginActions } from '~/reducers/resdex/login/reducer'

export const resDexUri = 'http://127.0.0.1:17445'

const t = translate('service')

class ResDexApiError extends Error {
  constructor(response, message) {
    const { error } = response
    super(error || message)
    this.response = response
    this.code = error && error.code
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

  sendWalletPassphrase(coin: string, password: string, timeout: number) {
		return this.query({
			method: 'walletpassphrase',
      coin,
			password,
      timeout: String(timeout)
		})
  }

  async getPendingSwaps() {
    const response = await this.query({
      method: 'swapstatus',
      pending: 1
    })

    return response.swaps
  }

  withdraw(opts) {
    const currency = getCurrency(opts.symbol)
    return currency.etomic
      ? this::withdrawEth(opts)
      : this::withdrawBtcFork(opts)
  }

	kickstart(requestId: number, quoteId: number) {
		return this.query({
			method: 'kickstart',
			requestid: requestId,
			quoteid: quoteId,
		})
	}

  setConfirmationsNumber(coin: string, confirmationsNumber: number) {
    return this.query({
      method: 'setconfirms',
      coin,
      numconfirms: confirmationsNumber
    })
  }

  async getRawTransaction(coin: string, txid: string) {
    return this.query({
      method: 'getrawtransaction',
      coin,
      txid,
    })
  }

  async listTransactions(coin: string, address: string) {
    const response = await this.query({
      method: 'listtransactions',
      coin,
      address
    })

    if (response.length && response[0].tx_hash) {
      return []

      /*
       * Commented out for now,
       * see https://github.com/ResistancePlatform/resistance-desktop-wallet/issues/213
       *

      const txids = response.map(item => item.tx_hash)
      const rawTransactions = await this::fetchTransactionsForAddress(coin, address, txids)
      return rawTransactions

      */
    }

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

  async enableCurrency(symbol: string, useElectrum: boolean = true) {
		const currency = getCurrency(symbol)

		if (!currency) {
      log.error(`Tried to enable unsupported currency:`, symbol)
      return
		}

		if (useElectrum && currency.electrumServers) {
      return this::enableElectrumServers(symbol)
		}

    let response

    try {
      response = await this.query({ method: 'enable', coin: symbol })
    } catch(err) {
      if (err.message.includes('couldnt find coin locally installed')) {
        log.error(`Can't enable a currency that's not installed locally, re-trying in Electrum mode`)
        return this::enableElectrumServers(symbol)
      }
    }

    return response.status === 'active'
  }

  disableCurrency(coin: string) {
		return this.query({
			method: 'disable',
			coin,
		})
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
  query(data: object, errorMessage?: string) {
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
        throw new ResDexApiError(response, errorMessage)
      }
      return response
    })
  }

}

async function enableElectrumServers(symbol) {
  const currency = getCurrency(symbol)

  const queries = currency.electrumServers.map(server => this.query({
    method: 'electrum',
    coin: symbol,
    ipaddr: server.host,
    port: server.port,
  }))

  const responses = await Promise.all(queries)
  const success = responses.filter(response => response.result === 'success').length > 0

  if (!success) {
    throw new Error(t(`Could not connect to {{symbol}} Electrum server`, { symbol }))
  }

  return success
}

async function withdrawBtcFork(opts) {
  const {
    hex: rawTransaction,
    txfee: txFeeSatoshis,
    txid,
    amount,
    symbol,
    address,
  } = await this::createTransaction(opts)

  // Convert from satoshis
  const SATOSHIS = 100000000
  const txFee = txFeeSatoshis / SATOSHIS

  const broadcast = async () => {
    await this::broadcastTransaction(opts.symbol, rawTransaction)

    return {txid, amount, symbol, address}
  }

  return {
    txFee,
    broadcast,
  }
}

async function withdrawEth(opts) {
  const {
    eth_fee: txFee,
    gas_price: gasPrice,
    gas,
  } = await this.query({
    method: 'eth_withdraw',
    coin: opts.symbol,
    to: opts.address,
    amount: opts.amount,
    broadcast: 0,
  })

  let hasBroadcast = false

  const broadcast = async () => {
    if (hasBroadcast) {
      throw new Error(t(`Transaction has already been broadcasted`))
    }
    hasBroadcast = true

    const response = await this.query({
      method: 'eth_withdraw',
      gas,
      gas_price: gasPrice,
      coin: opts.symbol,
      to: opts.address,
      amount: opts.amount,
      broadcast: 1,
    }, t(`Couldn't create withdrawal transaction`))

    return {
      txid: response.tx_id,
      symbol: opts.symbol,
      amount: opts.amount,
      address: opts.address,
    }
  }

  return {
    txFee,
    broadcast,
  }
}

async function createTransaction(opts) {
  const response = await this.query({
    method: 'withdraw',
    coin: opts.symbol,
    outputs: [{[opts.address]: opts.amount.toString()}],
    broadcast: 0,
  })

  if (!response.complete) {
    throw new ResDexApiError(response, t(`Couldn't create withdrawal transaction`))
  }

  return {
    ...opts,
    ...response,
  }
}

async function broadcastTransaction(symbol, rawTransaction) {
  const response = await this.query({
    method: 'sendrawtransaction',
    coin: symbol,
    signedtx: rawTransaction,
  })

  if (!response.result === 'success') {
    throw new ResDexApiError(response, t(`Couldn't broadcast transaction`))
  }

  return response.txid
}
