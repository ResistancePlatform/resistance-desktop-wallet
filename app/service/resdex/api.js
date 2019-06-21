// @flow
import { Decimal } from 'decimal.js'
import moment from 'moment'
import crypto from 'crypto'
import rp from 'request-promise-native'
import log from 'electron-log'

import { getActualSeedPhrase, getProcessSettings } from '~/service/resdex/resdex'
import { getStore } from '~/store/configureStore'
import { translate } from '~/i18next.config'
import { getCurrency } from '~/utils/resdex'
import { ResDexLoginActions } from '~/reducers/resdex/login/reducer'


const t = translate('service')

/**
 * ResDEX is using 3 processes, 1 for transparent and 2 for private trades.
 * Every API instance is a singleton corresponding to a specific process identified by its name.
 *
 */
const apiInstances = {}

/*
 * Returns ResDEX API instance for a process specified.
 *
 */
export function resDexApiFactory(processName: string) {
  if (processName in apiInstances) {
    return apiInstances[processName]
  }

  const api = new ResDexApiService(processName)
  apiInstances[processName] = api
  return api
}

class ResDexApiError extends Error {
  constructor(response, message) {
    const { error } = response
    super(error || message)
    this.response = response
    this.code = error && error.code
  }
}

/**
 * @export
 * @class ResDexApiService
 */
class ResDexApiService {
  token = null
  processName = null
  socket = false
	useQueue = false
	currentQueueId = 0

	/**
	 * @memberof ResDexApiService
	 */
	constructor(processName: string) {
    this.processName = processName
	}

  setToken(seedPhrase: string) {
    const actualSeedPhrase = getActualSeedPhrase(this.processName, seedPhrase)
    this.token = crypto.createHash('sha256').update(actualSeedPhrase).digest('hex')
  }

  sendWalletPassphrase(coin: string, password: string, timeout: number) {
		return this.query({
			method: 'walletpassphrase',
      coin,
			password,
      timeout,
		})
  }

  async getPendingSwaps() {
    const response = await this.query({
      method: 'my_recent_swaps',
    })

    // TODO: parse this correctly
    return response.result.swaps
  }

  async instantDexDeposit(weeks: number, amount: object) {
    const response = await this.query({
      method: 'instantdex_deposit',
      weeks,
      amount: amount.toString(),
      broadcast: 1
    })
    log.debug('instant dex response', response)
    return response
  }

  async withdraw(opts) {
		const response = await this.query({
			method: 'withdraw',
			coin: opts.symbol,
			amount: opts.amount,
			to:opts.address,
			broadcast: 1,
		})

		if (!response.tx_hash) {
			throw new ResDexApiError(response, t(`Couldn't create withdrawal transaction`))
		}

		return {
			...opts,
			...response,
		}
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
      log.debug(`Coin: ${JSON.stringify(currency)}`)
      const queryParams = Object.assign({}, {method: 'enable', mm2: 1}, currency)
      response = await this.query(queryParams)
      log.debug(`Response is: ${JSON.stringify(response)}`)
    } catch(err) {
      if (err.message.includes('couldnt find coin locally installed')) {
        log.error(`Can't enable a currency that's not installed locally, re-trying in Electrum mode`)
        // return this::enableElectrumServers(symbol)
				// TODO
        // return response.status === 'active'
        return false
      }
    }

		// TODO
    // return === 'active'

    return true
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
			// TODO
			// .filter(order => order.numutxos > 0)
			.map(order => ({
				address: order.address,
				depth: Decimal(order.depth),
				price: Decimal(order.price),
				utxoCount: order.numutxos,
				averageVolume: Decimal(order.avevolume),
				maxVolume: Decimal(order.maxvolume),
				zCredits: order.zcredits,
			}))

		const formattedResponse = {
			asks: formatOrders(response.asks),
			bids: formatOrders(response.bids),
		}

		return formattedResponse
	}

	/**
	 * Creates a market order.
   *
	 * @memberof ResDexApiService
	 */
  createMarketOrder(opts) {
    return this.query({
      method: opts.type,
      duration: 240,
      base: opts.baseCurrency,
      rel: opts.quoteCurrency,
      relvolume: opts.total.toNumber(),
      price: opts.price.toNumber(),
    })
  }

  async balance(coin: string, address: string) {
    const response = await this.query({
      method: 'balance',
      coin,
      address
    })

    return {
      balance: Decimal(response.balance),
      zCredits: Decimal(response.zcredits)
    }
  }

  async getOhlc(base: string, rel: string, timescale: number) {
    const response = await this.query({
      method: 'tradesarray',
      base,
      rel,
      timescale
    })

    // [timestamp, high, low, open, close, relvolume, basevolume, aveprice, numtrades]
    const trades = response.map(item => ({
      date: moment.unix(item[0]).toDate(),
      high: item[1],
      low: item[2],
      open: item[3],
      close: item[4],
      volume: item[6],
    }))

    return trades.filter(trade => trade.open > 0)
  }

  async getTrades(base: string, rel: string) {
    const response = await this.query({
      method: 'ticker',
      base,
      rel
    })

    const trades = response.map(item => ({
      time: moment.unix(item.timestamp).toDate(),
      baseAmount: Decimal(item[base]),
      quoteAmount: Decimal(item[rel]),
      price: Decimal(item.price),
    }))

    return trades
  }

  async getRecentSwaps() {
    const response = await this.query({ method: 'my_recent_swaps' })
    return response.result
  }

  async stop() {
    return this.query({ method: 'stop' })
  }

	/**
	 * Creates a limit order.
   *
	 * @memberof ResDexApiService
	 */
  createLimitOrder(opts) {
    return this.query({
      method: 'setprice',
      base: opts.baseCurrency,
      rel: opts.quoteCurrency,
      price: opts.price.toNumber(),
    })
  }

	/**
	 * Creates an instance of ResDexApiService.
   *
	 * @memberof ResDexApiService
	 */
  query(data: object, errorMessage?: string) {
    log.debug(`Calling ${this.processName} API method ${data.method}`, JSON.stringify(data))

    if (!this.token) {
      getStore().dispatch(ResDexLoginActions.showDialog())
      return Promise.reject(new Error(t(`Authentication failed`)))
    }

    const { uri } = getProcessSettings(this.processName)

    const options = {
      uri,
      method: 'POST',
      body: {
        ...data,
        userpass: this.token,
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

/* Private methods */

async function enableElectrumServers(symbol) {
  const currency = getCurrency(symbol)

  const queries = currency.electrumServers.map(server => this.query({
    method: 'electrum',
    coin: symbol,
    ipaddr: server.host,
    port: server.port,
  }))

  let responses

  try {
    responses = await Promise.all(queries)
  } catch(err) {
    log.error(`Error enabling Electrum currency`, err)
    return false
  }

  const success = responses.filter(response => response.result === 'success').length > 0

  if (!success) {
    log.error(`Could not connect to {{symbol}} Electrum server`)
  }

  return success
}
