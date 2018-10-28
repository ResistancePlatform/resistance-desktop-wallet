import coinlist from 'coinlist'

import { supportedCurrencies } from '~/constants/resdex/supported-currencies'

// const getCurrencySymbols = () => (
// 	_(supportedCurrencies)
// 		.chain()
// 		.map('coin')
// 		.without(...hiddenCurrencies)
// 		.orderBy()
// 		.value()
// )

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
	getCurrencyName,
	getCurrency,
  isEtomic,
}
