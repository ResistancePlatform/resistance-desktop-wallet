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
  ],
  getAvailableIndicators: t => ([
    {
      key: 'volume',
      name: t(`Volume`),
      ema: {
        period: 15,
        isEnabled: true,
      },
      colors: {
        up: '#1d2440',
        down: '#1d2440',
        ema: {
          stroke: '#009ed7',
          fill: '#1e4266',
        }
      }
    },
    {
      key: 'macd',
      name: t(`MACD — Moving Average Convergence/Divergence`),
      periods: {
        fast: 10,
        slow: 26,
        lag: 9,
      },
      colors: {
        main: '#e20063',
        signal: '#00d492',
        histogram: '#009ed8'
      }
    },
    {
      key: 'ema',
      name: t(`EMA — Exponential Moving Average`),
      emas: [
        {
          period: 20,
          isEnabled: true,
          color: '#00d492'
        },
        {
          period: 50,
          isEnabled: false,
          color: '#e20063'
        },
        {
          period: 100,
          isEnabled: false,
          color: '#f7a336'
        },
        {
          period: 250,
          isEnabled: false,
          color: 'rgb(238, 238, 241)'
        },
        {
          period: 360,
          isEnabled: false,
          color: '#7557b4'
        },
      ]
    },
    {
      key: 'bb',
      name: t(`Bollinger Bands`),
      sma: 20,
      standardDeviation: 2,
      colors: {
        top: '#009ed7',
        middle: '#9c62e5',
        bottom: '#009ed7',
        fill: '#3f356e',
      }
    },
    {
      key: 'rsi',
      name: t(`RSI — Relative Strength Index`),
      period: 14,
      os: 35,
      color: 'rgb(238, 238, 241)',
      isEnabled: true,
    },
    {
      key: 'sma',
      name: t(`SMA — Simple Moving Average`),
      isNotImplemented: true,
    },
    {
      key: 'wma',
      name: t(`WMA — Weighted Moving Average`),
      isNotImplemented: true,
    },
    {
      key: 'sar',
      name: t(`Parabolic SAR — Stop And Reverse`),
      isNotImplemented: true,
    },
    {
      key: 'stochastic',
      name: t(`Stochastic — fast, slow, full`),
      isNotImplemented: true,
    },
    {
      key: 'forceIndex',
      name: t(`ForceIndex`),
      isNotImplemented: true,
    },
    {
      key: 'elderRay',
      name: t(`ElderRay`),
      isNotImplemented: true,
    },
    {
      key: 'elderImpulse',
      name: t(`Elder Impulse`),
      isNotImplemented: true,
    },
  ])
}

export { RESDEX }
