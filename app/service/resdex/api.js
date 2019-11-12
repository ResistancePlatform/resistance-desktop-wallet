// @flow
import { Decimal } from 'decimal.js'
import moment from 'moment'
import crypto from 'crypto'
import rp from 'request-promise-native'
import log from 'electron-log'

import { RESDEX } from '~/constants/resdex'
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

const kycApiUrl = 'https://kvk0a65tl4.execute-api.us-east-1.amazonaws.com'

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
  constructor(response, message, data) {
    const { error } = response
    super(error || message)
    this.response = response
    this.code = error && error.code
    this.data = data
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
    })
    log.debug('Instant DEX response', response)
    return response
  }

  async withdraw(opts) {
    const options = {
			method: 'withdraw',
			coin: opts.symbol,
			amount: opts.amount,
			to: opts.address,
			broadcast: true,
		}

    // SegWit addresses are not allowed
    if (['BTC', 'BCH'].includes(opts.symbol) && !opts.address.startsWith('1')) {
			throw new ResDexApiError({}, t(`SegWit addresses are not supported by ResDEX`))
    }

    if (opts.symbol === 'BTC') {
      const btcFee = (
        Decimal(39)
          .times(1000)
          .dividedBy(Decimal(RESDEX.satoshiDivider))
          .toString()
      )

      options.fee = {
        type: 'UtxoPerKbyte',
        amount: btcFee
      }

      log.debug(`Using custom fee for BTC:`, btcFee)
    }

		const response = await this.query(options)

		if (!response.tx_hash) {
			throw new ResDexApiError(response, t(`Couldn't create withdrawal transaction`))
		}

		return {
			...opts,
			...response,
		}
  }

  setConfirmationsNumber(coin: string, confirmationsNumber: number) {
    return this.query({
      method: 'setconfirms',
      coin,
      numconfirms: confirmationsNumber
    })
  }

  async getTransactionDetails(coin: string, txid: string) {
    return this.query({
      method: 'get_transaction_details',
      coin,
      txid,
    })
  }

  async getTransactionHistory(coin: string) {
		const currency = getCurrency(coin)

    const response = await this.query({
      method: 'my_tx_history',
      coin,
      limit: 10,
      from_id: null,
    })

    if (!response.result || !response.result.transactions) {
      return []
    }

    const { transactions } = response.result

    if (transactions.length && transactions[0].tx_hash) {
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

    const divider = currency.etomic ? RESDEX.weiDivider : RESDEX.satoshiDivider

    const result = transactions.map(transaction => ({
      ...response,
      amount: Decimal(transaction.amount),
      fee: Decimal(transaction.fee).dividedBy(divider),
    }))

    return result
  }

	async getFee(coin) {
		const currency = getCurrency(coin)

    let response

    try {
      response = await this.query({
        method: 'getfee',
        coin,
      })
      log.debug(`Get fee response`, response)
    } catch(err) {
      log.error(`Can't get fee for ${coin}, assuming 0.0001`, err)
      return Decimal('0.0001')
    }

    const divider = currency.etomic ? RESDEX.weiDivider : RESDEX.satoshiDivider
    return Decimal(response.txfee).dividedBy(divider)
	}

  async getPortfolio() {
    const portfolio = await this.query({ method: 'portfolio' })
    log.debug(`Portfolio:`, JSON.stringify(portfolio))
    return portfolio
  }

  async enableCurrency(symbol: string, useElectrum: boolean = true) {
		const currency = getCurrency(symbol)

		if (!currency) {
      log.error(`Tried to enable unsupported currency:`, symbol)
      return
		}

		if (useElectrum && currency.electrumServers) {
      return this::enableWithElectrum(symbol)
		}

    let response

    log.debug(`Enable currency: ${JSON.stringify(currency)}`)

    const queryParams = {
      ...currency,
      method: 'enable',
      mm2: 1,
    }

    try {
      response = await this.query(queryParams)
      log.debug(`Enable currency response`, symbol, response)
    } catch(err) {
      log.debug(`Error enabling currency`, symbol, response)

      if (err.message.includes('couldnt find coin locally installed')) {
        log.error(`Can't enable a currency that's not installed locally, re-trying in Electrum mode`)
        return this::enableWithElectrum(symbol)
      }
    }

    return response && response.result === 'success'
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

    log.debug("Order book", JSON.stringify(response))

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
			})).sort((o1, o2) => o2.price.minus(o1.price).toNumber())

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
  async createMarketOrder(opts) {
    const response = await this.query({
      method: opts.type,
      duration: 240,
      base: opts.baseCurrency,
      rel: opts.quoteCurrency,
      volume: opts.amount.toNumber(),
      price: opts.price.toNumber(),
      instant_swap: true,
    })

    return response.result
  }

  async getDynamicTrust(coin: string, amount: object) {
    const response = await this.query({
      method: 'my_dynamictrust',
      coin,
      amount: amount.toString()
    })

    log.debug(`Dynamic trust response`, response)

    return {
      address: response.address,
      zCredits: Decimal(response.zcredits),
      dynamicTrust: Decimal(response.dynamictrust),
    }
  }

  async getOhlc(base: string, rel: string, timescale: number) {
    const response = await this.query({
      method: 'ohlc_data',
      base,
      rel,
      timescale
    })

    // log.debug(`OHLC data response`, JSON.stringify(response))

    // [timestamp, high, low, open, close, relvolume, basevolume, aveprice, numtrades]
    const ohlcData = response.map(item => ({
      date: moment.unix(item[0]).toDate(),
      high: item[1],
      low: item[2],
      open: item[3],
      close: item[4],
      volume: item[6],
    }))

    return ohlcData
  }

  async getTrades(base: string, rel: string) {
    const response = await this.query({
      method: 'swap_history',
      base,
      rel,
      limit: 50,
      from_uuid: null
    })

    // log.debug(`Get Trades response`, JSON.stringify(response))
    const { swaps } = response.result

    const trades = swaps.map(item => ({
      uuid: item[0],
      time: moment(item[1]).toDate(),
      baseAmount: Decimal(item[2]),
      quoteAmount: Decimal(item[3]),
      price: Decimal(item[4]),
    })).sort((t1, t2) => t2.time - t1.time)

    return trades
  }

  async getRecentSwaps() {
    const response = await this.query({ method: 'my_recent_swaps' })
    return response.result
  }

  async getOrders() {
    const response = await this.query({ method: 'my_orders' })
    log.debug(`My orders response:`, response)

    const {
      taker_orders: takerOrders,
      maker_orders: makerOrders
    } = response.result

    const zeroIfUndefined = d => Decimal(d || 0)

    const convert = (o, type) => ({
      uuid: o.uuid,
      type,
      baseCurrency: o.base,
      quoteCurrency: o.rel,
      price: zeroIfUndefined(o.price),
      baseCurrencyAmount: zeroIfUndefined(o.available_amount),
      quoteCurrencyAmount: (
        zeroIfUndefined(o.available_amount).times(zeroIfUndefined(o.price))
      ),
      timeStarted: moment(o.created_at).toDate(),
      isInstantSwap: o.instant_swap,
      isCancellable: o.cancellable,
    })

    const result = Object.values(makerOrders)
      .map(o => convert(o, 'Maker'))
      .concat(
        Object.values(takerOrders)
          .map(o => convert(o, 'Taker'))
      )

    return result
  }

  async stop() {
    return this.query({ method: 'stop' })
  }

	/**
	 * Creates a limit order.
   *
	 * @memberof ResDexApiService
	 */
  async createLimitOrder(opts) {
    const response = await this.query({
      method: 'setprice',
      base: opts.baseCurrency,
      rel: opts.quoteCurrency,
      volume: opts.baseCurrencyAmount,
      price: opts.price.toNumber(),
      instant_swap: true,
    })
    return response.result
  }

	/**
	 * Cancels an order.
   *
	 * @memberof ResDexApiService
	 */
  async cancelOrder(uuid: string): boolean {
    const response = await this.query({
      method: 'cancel_order',
      uuid,
    })

    return response.result === 'success'
  }

	/**
	 * Signs a KYC message.
   *
	 * @memberof ResDexApiService
	 */
  signKycMessage(message) {
    return this.query({
      method: 'sign_kyc_msg',
      msg: JSON.stringify(message),
    })
  }


	/**
	 * Register the KYC tid within ResDEX
   *
	 * @memberof ResDexApiService
	 */
  async kycRegister(tid: string): boolean {
    const payload = await this.signKycMessage({ tid })
    log.debug(`Submitting KYC ID to ResDEX:`, tid)
    log.debug(`Got KYC registration payload:`, payload)

    try {
      const result = await this.postJson(`${kycApiUrl}/api/v1/register`, payload)
      log.debug(`Register result`, typeof result, result)
      return typeof result === "string" && result.includes(' VALID KYC')
    } catch (err) {
      log.error(`Can't submit verification form:`, err)
      return false
    }

    // TODO: Reuse in case of per-portfolio KYC
    //
    // const { defaultPortfolioId } = this.props.resDex.login
    //
    // if (!isRegistered) {
    //   toastr.error(t(`Error submitting verification form, please make sure your Internet connection is good or check the log for details.`))
    // } else {
    //   toastr.success(t(`You have successfully passed verification!`))
    // }

  }

  async postJson(url, jsonData) {
    const result = await rp({
      url,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(jsonData)
    })
    return result
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

    log.debug(`Token for ${this.processName}:`, this.token)

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

    return rp(options)
      .then(response => {
        if (response.error) {
          throw new ResDexApiError(response, errorMessage, data)
        }
        return response
      })
      .catch(error => {
          throw new ResDexApiError({error}, errorMessage, data)
      })
  }

}

/* Private methods */

async function enableWithElectrum(symbol) {
  const currency = getCurrency(symbol)

  if (!currency) {
    throw new Error(`Currency ${symbol} not found.`)
  }

  if (!currency.electrumServers) {
    throw new Error(`Currency ${symbol} doesn't have Electrum servers configured.`)
  }

  const servers = currency.electrumServers.map(server => ({
    url: `${server.host}:${server.port}`
  }))

  log.debug(`Electrum servers for ${symbol}:`, servers)

  const response = await this.query({
    method: 'electrum',
    coin: symbol,
    servers,
    mm2: 1,
  })

  log.debug(`Electrum call response:`, response)
  return response && response.result === 'success'
}
