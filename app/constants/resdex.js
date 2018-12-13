import { Decimal } from 'decimal.js'

const RESDEX = {
  dexFee: Decimal('0.15'),
  resFee: Decimal('0.0001'),
  currencyHistoryResolutions: ['hour', 'day', 'week', 'month', 'year'],
	ignoreExternalPrice: new Set([
		'REVS',
		'SUPERNET',
		'PIZZA',
		'BEER',
		'EQL',
	]),
  alwaysEnabledCurrencies: [
    {
      symbol: 'RES',
      useElectrum: false
    },
    {
      symbol: 'ETOMIC',
      useElectrum: false
    },
    {
      symbol: 'ETH',
      useElectrum: true
    },
    {
      symbol: 'BTC',
      useElectrum: true
    },
    {
      symbol: 'DGB',
      useElectrum: true
    },
  ]
}

export { RESDEX }
