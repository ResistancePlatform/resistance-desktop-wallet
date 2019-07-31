import os from 'os'
import { remote } from 'electron'
import config from 'electron-settings'
import { Decimal } from 'decimal.js'
import { RESDEX } from '~/constants/resdex'
import { InteractiveYCoordinate } from 'react-stockcharts/lib/interactive'

export const preloadedState: State = {
  auth: {
    reason: null,
    enter: true,
    isLoginRequired: true,
  },
  roundedForm: {},
  fetchParameters: {
    progressRate: 0,
    startedAt: null,
    minutesLeft: null,
    statusMessage: '',
    errorMessage: null,
    isDownloadComplete: false,
  },
  getStarted: {
    createNewWallet: {
      wallet: null
    },
    welcome: {
      hint: null,
      status: null,
      isBootstrapping: false,
      isReadyToUse: false
    },
    isCreatingNewWallet: true,
    isInProgress: true
  },
  rpcPolling: {
    registeredActions: [],
    actionsResponseReceived: {}
  },
  loadingPopup: {
    isVisible: false,
    message: ''
  },
  popupMenu: {},
	navi: {
		currentNaviPath: '/overview'
	},
	systemInfo: {
		daemonInfo: {},
		blockchainInfo: {
			connectionCount: 0,
			blockchainSynchronizedPercentage: 0,
			lastBlockDate: null
		},
    operations: [],
		miner: {
			hashingPower: 0,
			minedBlocksNumber: 0
		},
    isNewOperationTriggered: false,
    isOperationsModalOpen: false
	},
	overview: {
		balances: {
			transparentBalance: Decimal('0'),
			transparentUnconfirmedBalance: Decimal('0'),
			privateBalance: Decimal('0'),
			privateUnconfirmedBalance: Decimal('0'),
			totalBalance: Decimal('0'),
			totalUnconfirmedBalance: Decimal('0')
		},
		transactions: [],
		transactionDetails: {}
	},
	ownAddresses: {
		addresses: [],
		showDropdownMenu: false,
    frozenAddresses: {},
    connectLedgerModal: {
      isVisible: false,
      isLedgerConnected: false,
      isTransactionConfirmed: false,
      isTransactionSent: false,
      isLedgerResistanceAppOpen: false,
      ledgerAddress: "",
      destinationAddress: "",
      destinationAmount: Decimal('0'),
      isTransactionPending: false,
      ledgerBalance: "0",
      txid: "",
      pollForLedger: true,
    }
	},
	sendCurrency: {
    arePrivateTransactionsEnabled: false,
    addresses: [],
    addressSearchString: '',
    isSubmitting: false
	},
	addressBook: {
		records: [],
    newAddressModal: {
      defaultValues: {},
      isVisible: false
    }
	},
	settings: {
    isSavingPassword: false,
		isTorEnabled: false,
		isMinerEnabled: false,
		isStatusModalOpen: false,
    statusModalTabIndex: 0,
		childProcessesStatus: {
			NODE: 'NOT RUNNING',
			NODE_ETOMIC: 'NOT RUNNING',
			MINER: 'NOT RUNNING',
      TOR: 'NOT RUNNING',
      RESDEX: 'NOT RUNNING',
      RESDEX_PRIVACY1: 'NOT RUNNING',
      RESDEX_PRIVACY2: 'NOT RUNNING',
    },
    language: 'en',
	},
  resDex: {
    common: {
      isExpanded: false,
      selectedTabIndex: 0,
    },
    bootstrapping: {
      isInProgress: false,
      isRestoring: false,
      generatedSeedPhrase: null,
    },
    login: {
      isRequired: true,
      isInProgress: false,
      defaultPortfolioId: null,
      portfolios: [],
    },
    assets: {
      resolution: 'month',
      currencyHistory: {},
    },
    buySell: {
      selectedTabIndex: 0,
      isAdvanced: false,
      isSendingOrder: false,
      baseCurrency: 'RES',
      quoteCurrency: 'ETH',
      orderBook: {
        baseCurrency: 'RES',
        quoteCurrency: 'ETH',
        baseQuote: {
          bids: [],
          asks: [],
        },
        resQuote: {
          bids: [],
          asks: [],
        },
        baseRes: {
          bids: [],
          asks: [],
        }
      },
      enhancedPrivacy: false,
      ohlc: [],
      trades: [],
      tradingChart: {
        period: 'day',
        type: 'candlestick',
        indicators: {
        },
        editFormIndicatorKey: null,
        interactiveMode: null,
        interactive: {
          'Trendline_1': [],
          'FibonacciRetracement_1': [],
          'EquidistantChannel_1': [],
          'StandardDeviationChannel_1': [],
          'GannFan_1': [],
          'InteractiveText_1': [],
          'InteractiveYCoordinate_1': [{
            ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
            yValue: 55.90,
            id: 220,
            draggable: true,
          }],
        }
      },
      indicatorsModal: {
        isVisible: false,
        searchString: '',
        formKey: null
      },
      editTextModal: {
        isVisible: false,
        sumbitCallback: null,
        defaultText: '',
        type: 'label'
      }
    },
    orders: {
      isInitialKickStartDone: false,
      pendingSwaps: {},
      swapHistory: [],
      orderModal: {
        isVisible: false,
        uuid: null
      }
    },
    accounts: {
      transactions: {},
      currencies: {
        RESDEX: {},
        RESDEX_PRIVACY1: {},
        RESDEX_PRIVACY2: {},
      },
      enabledCurrencies: [],
      currencyFees: {},
      zCredits: null,
      addCurrencyModal: {
        isInEditMode: false,
        isVisible: false,
        defaultValues: {
          symbol: null,
          useElectrum: true,
          rpcPort: null
        }
      },
      instantDexDepositModal: {
        isVisible: false,
      },
      depositModal: {
        isVisible: false,
        symbol: null
      },
      withdrawModal: {
        isInProgress: false,
        isVisible: false,
        symbol: null,
        secretFunds: false
      }
    }
  },
  dutchAuction: {
    status: {},
    user: {
      ethAddress: null,
      ethCommitted: null,
    },
    resAddress: null,
    kyc: {
      tid: null,
      email: null,
      phone: null,
    },
    credentials: {
      userId: null,
      accessToken: null,
    },
    isGeneratingAddress: false,
    isRegistering: false
  },
}

// Load serialized settings
Object.assign(preloadedState.fetchParameters, {
  isDownloadComplete: remote.getGlobal('isParametersPresenceConfirmed', false)
})

Object.assign(preloadedState.getStarted, {
	isInProgress: config.get('getStartedInProgress', true)
})

Object.assign(preloadedState.settings, {
	isMinerEnabled: config.get('manageDaemon.enableMiner', false),
	isTorEnabled: config.get('manageDaemon.enableTor', false),
  cpuCoresNumber: config.get('manageDaemon.cpuCoresNumber', os.cpus().length),
	language: config.get('language', 'en')
})

Object.assign(preloadedState.resDex.login, {
  defaultPortfolioId: config.get('resDex.defaultPortfolioId', null)
})

Object.assign(preloadedState.resDex.bootstrapping, {
  isInProgress: config.get('resDex.bootstrappingInProgress', true)
})

Object.assign(preloadedState.dutchAuction, {
  resAddress: config.get('dutchAuction.resAddress', null),
  kyc: config.get('dutchAuction.kyc', preloadedState.dutchAuction.kyc),
  credentials: config.get('dutchAuction.credentials', preloadedState.dutchAuction.credentials),
})

const enabledCurrencies = config.get('resDex.enabledCurrencies', [])

// Merge with always enabled currencies
RESDEX.alwaysEnabledCurrencies.forEach(currency => {
  const index = enabledCurrencies.findIndex(c => c.symbol === currency.symbol)
  if (index === -1) {
    enabledCurrencies.push(currency)
  }
})

Object.assign(preloadedState.resDex.accounts, {
  selectedSymbol: enabledCurrencies[0].symbol,
  enabledCurrencies,
})

