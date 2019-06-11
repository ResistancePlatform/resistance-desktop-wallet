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
    // {
    //   symbol: 'ETOMIC',
    //   useElectrum: false
    // },
    {
      symbol: 'ETH',
      useElectrum: false
    },
    {
      symbol: 'BTC',
      useElectrum: false
    },
    /*{
      symbol: 'LTC',
      useElectrum: true
    },*/
    /*{
      symbol: 'DGB',
      useElectrum: true
    },
    {
      symbol: 'MONA',
      useElectrum: true
    },*/
    // {
    //   symbol: 'NEXO',
    //   useElectrum: true
    // },
    // {
    //   symbol: 'ZIL',
    //   useElectrum: true
    // },
  ]
}

export { RESDEX }
