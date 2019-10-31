import log from 'electron-log'
import { Decimal } from 'decimal.js'
import coinlist from 'coinlist'

import { translate } from '../i18next.config'
import { supportedCurrencies } from '~/constants/resdex/supported-currencies'


const t = translate('resdex')

function getOrdersBreakdown(swapHistory) {
  const status = o => o.isPrivate ? o.privacy.status : o.status
  const completed = o => ['completed', 'failed', 'cancelled'].includes(status(o))

  const visibleOrders = swapHistory.filter(o => o.isHidden === false)

  const openOrders = visibleOrders.filter(o => !o.isSwap && !completed(o))
  const openSwaps = visibleOrders.filter(o => o.isSwap && !completed(o))
  const completedSwaps = visibleOrders.filter(o => completed(o))

  return ({
    openOrders,
    openSwaps,
    completedSwaps
  })
}

function getEquity(symbol, amount, currencyHistory) {
  if (!amount) {
    return null
  }
  const hourHistory = currencyHistory.hour && currencyHistory.hour[symbol]
  const price = hourHistory && hourHistory.slice(-1)[0].value
  log.debug(symbol, amount, price && price.toString())
  return amount && price && Decimal(amount).mul(price).toDP(2, Decimal.ROUND_FLOOR)
}

function getIsLoginDisabled(props: object) {
  const isNodeRunning = props.settings.childProcessesStatus.NODE === 'RUNNING'
  const isDisabled = !isNodeRunning || props.resDex.login.isInProgress
  return isDisabled
}

const getOrderStatusName = order => {
  const names = {
    pending: t(`Pending`),
    completed: t(`Completed`),
    matched: t(`Matched`),
    swapping: t(`Swapping`),
    unmatched: t(`Unmatched`),
    failed: t(`Failed`),
    cancelled: t(`Cancelled`),
  }

  if (order.isPrivate) {
    Object.assign(names, {
      swapping_rel_res: t(`Swapping {{pair}}`, { pair: `${order.privacy.quoteCurrency}/RES` }),
      swapping_res_base: t(`Swapping {{pair}}`, { pair: `RES/${order.privacy.baseCurrency}` }),
      privatizing: t(`Privatizing`),
    })
  }

  const status = order.isPrivate ? order.privacy.status : order.status

  return names[status] || status
}

const getSortedCurrencies = currencies => {
  const sortedCurrencies = currencies.slice().sort(
    (currency1, currency2) => [currency1.symbol, currency2.symbol].includes('RES')
      ? Number(currency1.symbol !== 'RES') * 2 - 1
      : currency1.symbol.localeCompare(currency2.symbol)
  )

  return sortedCurrencies
}

const getCurrency = symbol => supportedCurrencies.find(currency => currency.coin === symbol)

const getCurrencyName = symbol => {
	const coinParams = getCurrency(symbol)
	return coinParams.name || coinlist.get(symbol, 'name') || symbol
}

const isEtomic = symbol => {
	const currency = getCurrency(symbol)

	if (!currency) {
		throw new Error(`Unsupported currency: "${symbol}"`)
	}

	return currency.etomic
}


const getPeriodCaption = period => ({
  hour: t(`1H`),
  day: t(`1D`),
  week: t(`1W`),
  month: t(`1M`),
  year: t(`1Y`),
  all: t(`All`),
})[period]

export {
  getOrdersBreakdown,
  getIsLoginDisabled,
  getEquity,
  getOrderStatusName,
  getSortedCurrencies,
	getCurrencyName,
	getCurrency,
  isEtomic,
  getPeriodCaption
}
