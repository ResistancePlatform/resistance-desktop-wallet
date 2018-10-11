import { Decimal } from 'decimal.js'

const RESDEX = {
  dexFee: Decimal('0.15'),
  resFee: Decimal('0.1'),
  alwaysEnabledCurrencies: [
    {
      symbol: 'RES',
      useElectrum: false
    },
    {
      symbol: 'BTC',
      useElectrum: true
    },
    {
      symbol: 'LTC',
      useElectrum: true
    },
    {
      symbol: 'DGB',
      useElectrum: true
    },
    {
      symbol: 'HODLC',
      useElectrum: false
    },
  ]
}

export { RESDEX }
