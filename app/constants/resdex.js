import { Decimal } from 'decimal.js'

const RESDEX = {
  dexFee: Decimal('0.15'),
  resFee: Decimal('0.0001'),
  satoshiDivider: 100000000,
  weiDivider: 1000000000000000000,
  currencyHistoryResolutions: ['hour', 'day', 'week', 'month', 'year'],
	ignoreExternalPrice: new Set([]),
  alwaysEnabledCurrencies: [
    {
      symbol: 'RES',
      useElectrum: false
    },
    {
      symbol: 'ETH',
      useElectrum: false
    },
    {
      symbol: 'BTC',
      useElectrum: true
    },
    {
      symbol: 'USDT',
      useElectrum: false
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
  chartFontFamily: `Quicksand, Arial, Helvetica, Helvetica Neue, serif`,
  getAvailableIndicators: t => ([
    {
      key: 'volume',
      label: t(`Volume`),
      formHeight: '13rem',
      inputs: [
        {
          name: 'smaPeriod',
          label: t(`SMA Period`),
          type: 'number',
          value: 20,
        },
        {
          name: 'isSmaEnabled',
          label: t(`Enable SMA`),
          type: 'boolean',
          value: true,
        },
      ],
      colors: [
        {
          name: 'volumeUp',
          label: t(`Volume Up`),
          value: '#1d2440',
        },
        {
          name: 'volumeDown',
          label: t(`Volume Down`),
          value: '#1d2440',
        },
        {
          name: 'smaStroke',
          label: t(`SMA Stroke`),
          value: '#009ed7'
        },
        {
          name: 'smaFill',
          label: t(`SMA Fill`),
          value: '#1e4266'
        }
      ]
    },
    {
      key: 'macd',
      label: t(`MACD — Moving Average Convergence/Divergence`),
      formHeight: '10.5rem',
      inputs: [
        {
          name: 'fastPeriod',
          label: t(`Fast Period`),
          type: 'number',
          value: 10,
        },
        {
          name: 'slowPeriod',
          label: t(`Slow Period`),
          type: 'number',
          value: 26,
        },
        {
          name: 'signalPeriod',
          label: t(`Signal Period`),
          type: 'number',
          value: 9,
        },
      ],
      colors: [
        {
          name: 'main',
          label: t(`Main`),
          value: '#e20063',
        },
        {
          name: 'signal',
          label: t(`Signal`),
          value: '#00d492',
        },
        {
          name: 'histogram',
          label: t(`Histogram`),
          value: '#009ed8',
        },
      ]
    },
    {
      key: 'ema',
      label: t(`EMA — Exponential Moving Average`),
      formHeight: '16.5rem',
      inputs: [
        {
          name: 'ema1Period',
          label: t(`EMA 1 Period`),
          type: 'number',
          value: 20,
        },
        {
          name: 'isEma1Enabled',
          label: t(`Enable EMA 1`),
          type: 'boolean',
          value: true,
        },
        {
          name: 'ema2Period',
          label: t(`EMA 2 Period`),
          type: 'number',
          value: 50,
        },
        {
          name: 'isEma2Enabled',
          label: t(`Enable EMA 2`),
          type: 'boolean',
          value: true,
        },
        {
          name: 'ema3Period',
          label: t(`EMA 3 Period`),
          type: 'number',
          value: 100,
        },
        {
          name: 'isEma3Enabled',
          label: t(`Enable EMA 3`),
          type: 'boolean',
          value: true,
        },

      ],
      colors: [
        {
          name: 'ema1',
          label: t(`EMA 1`),
          value: '#00d492'
        },
        {
          name: 'ema2',
          label: t(`EMA 2`),
          value: '#e20063'
        },
        {
          name: 'ema3',
          label: t(`EMA 3`),
          value: '#f7a336'
        }
      ]
    },
    {
      key: 'bb',
      label: t(`Bollinger Bands`),
      formHeight: '13rem',
      inputs: [
        {
          name: 'smaPeriod',
          label: t(`SMA Period`),
          type: 'number',
          value: 20,
        },
        {
          name: 'standardDeviation',
          label: t(`Standard Deviation`),
          type: 'number',
          value: 2,
          min: 1,
          max: 100
        },
      ],
      colors: [
        {
          name: 'top',
          label: t(`Top`),
          value: '#009ed7',
        },
        {
          name: 'middle',
          label: t(`Middle`),
          value: '#009ed7',
        },
        {
          name: 'bottom',
          label: t(`Bottom`),
          value: '#009ed7',
        },
        {
          name: 'fill',
          label: t(`Fill`),
          value: '#3f356e',
        },
      ],
    },
    {
      key: 'rsi',
      label: t(`RSI — Relative Strength Index`),
      formHeight: '5rem',
      inputs: [
        {
          name: 'period',
          label: t(`Period`),
          type: 'number',
          value: 14,
        },
      ],
      colors: [
        {
          name: 'stroke',
          label: t(`Stroke`),
          value: 'rgb(238, 238, 241)',
        },
      ]
    },
    {
      key: 'sma',
      label: t(`SMA — Simple Moving Average`),
      inputs: [],
      colors: [],
      isNotImplemented: true,
    },
    {
      key: 'wma',
      label: t(`WMA — Weighted Moving Average`),
      inputs: [],
      colors: [],
      isNotImplemented: true,
    },
    {
      key: 'sar',
      label: t(`Parabolic SAR — Stop And Reverse`),
      inputs: [],
      colors: [],
      isNotImplemented: true,
    },
    {
      key: 'stochastic',
      label: t(`Stochastic — fast, slow, full`),
      inputs: [],
      colors: [],
      isNotImplemented: true,
    },
    {
      key: 'forceIndex',
      label: t(`ForceIndex`),
      inputs: [],
      colors: [],
      isNotImplemented: true,
    },
    {
      key: 'elderRay',
      label: t(`ElderRay`),
      inputs: [],
      colors: [],
      isNotImplemented: true,
    },
    {
      key: 'elderImpulse',
      label: t(`Elder Impulse`),
      inputs: [],
      colors: [],
      isNotImplemented: true,
    },
  ])
}

export { RESDEX }
