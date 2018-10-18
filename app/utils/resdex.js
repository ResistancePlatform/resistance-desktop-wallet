import { Decimal } from 'decimal.js'
import coinlist from 'coinlist'

import { RESDEX } from '~/constants/resdex'
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

const calculateMaxTotalPayout = (quoteAmount, price, quoteFee) => {
  const dexFee = RESDEX.dexFee.div(Decimal('100'))
  const divider = price.plus(price.times(dexFee)).plus(quoteFee)
  return quoteAmount.dividedBy(divider)
}


export {
	// getCurrencySymbols,
	getCurrencyName,
	getCurrency,
  isEtomic,
  calculateMaxTotalPayout,
}
