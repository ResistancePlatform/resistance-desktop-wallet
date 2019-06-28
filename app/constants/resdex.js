import { Decimal } from 'decimal.js'

const RESDEX = {
  dexFee: Decimal('0.15'),
  resFee: Decimal('0.0001'),
  currencyHistoryResolutions: ['hour', 'day', 'week', 'month', 'year'],
	ignoreExternalPrice: new Set([]),
  alwaysEnabledCurrencies: [
    {
      symbol: 'RES',
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
      symbol: 'USDT',
      useElectrum: true
    },
  ],
  errorEvents: [
    'StartFailed',
    'NegotiateFailed',
    'TakerFeeSendFailed',
    'MakerPaymentValidateFailed',
    'TakerPaymentTransactionFailed',
    'TakerPaymentDataSendFailed',
    'TakerPaymentWaitForSpendFailed',
    'MakerPaymentSpendFailed',
    'TakerPaymentRefunded',
    'TakerPaymentRefundFailed'
  ],
  successEvents: [
    'Started',
    'Negotiated',
    'TakerFeeSent',
    'MakerPaymentReceived',
    'MakerPaymentWaitConfirmStarted',
    'MakerPaymentValidatedAndConfirmed',
    'TakerPaymentSent',
    'TakerPaymentSpent',
    'MakerPaymentSpent',
    'Finished'
  ]
}

export { RESDEX }
