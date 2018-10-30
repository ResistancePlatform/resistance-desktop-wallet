import coinlist from 'coinlist'

import { translate } from '../i18next.config'
import { supportedCurrencies } from '~/constants/resdex/supported-currencies'


const t = translate('resdex')

// const getCurrencySymbols = () => (
// 	_(supportedCurrencies)
// 		.chain()
// 		.map('coin')
// 		.without(...hiddenCurrencies)
// 		.orderBy()
// 		.value()
// )

const getOrderStatusName = (status: string) => ({
  pending: t(`Pending`),
  completed: t(`Completed`),
  matched: t(`Matched`),
  swapping: t(`Swapping`),
  unmatched: t(`Unmatched`),
  failed: t(`Failed`),
}[status] || status)

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


export {
	// getCurrencySymbols,
  getOrderStatusName,
  getSortedCurrencies,
	getCurrencyName,
	getCurrency,
  isEtomic,
}
