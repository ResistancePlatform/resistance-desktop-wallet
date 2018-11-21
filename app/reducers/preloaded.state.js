import { remote } from 'electron'
import config from 'electron-settings'
import { Decimal } from 'decimal.js'
import { RESDEX } from '~/constants/resdex'

export const preloadedState: State = {
  auth: {
    reason: null,
    enter: true,
    isLoginRequired: true,
  },
  roundedForm: {},
  fetchParameters: {
    progressRate: 0,
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
    frozenAddresses: {}
	},
	sendCash: {
		isPrivateTransactions: false,
		lockIcon: 'Unlock',
		lockTips: null,
		fromAddress: '',
		toAddress: '',
		inputTooltips: '',
		amount: Decimal('0'),
		currentOperation: null,
		showDropdownMenu: false,
		sendFromRadioButtonType: 'transparent',
    addressList: [],
    isInputDisabled: false
	},
	addressBook: {
		records: [],
    newAddressModal: {
      defaultValues: {},
      isVisible: false
    }
	},
	settings: {
		isTorEnabled: false,
		isMinerEnabled: false,
		isStatusModalOpen: false,
		childProcessesStatus: {
			NODE: 'NOT RUNNING',
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
      isSendingOrder: false,
      baseCurrency: 'RES',
      quoteCurrency: 'DGB',
      orderBook: {
        baseCurrency: 'RES',
        quoteCurrency: 'DGB',
        baseQuote: {
          bids: [],
          asks: [],
        },
        baseRes: {
          bids: [],
          asks: [],
        },
        quoteRes: {
          bids: [],
          asks: [],
        },
      },
      enhancedPrivacy: false,
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
      currencies: {},
      enabledCurrencies: [],
      currencyFees: {},
      addCurrencyModal: {
        isInEditMode: false,
        isVisible: false,
        defaultValues: {
          symbol: null,
          useElectrum: true,
          rpcPort: null
        }
      },
      depositModal: {
        isVisible: false,
        symbol: null
      },
      withdrawModal: {
        isInProgress: false,
        isVisible: false,
        symbol: null
      }
    }
  }
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
	language: config.get('language', 'en')
})

Object.assign(preloadedState.resDex.login, {
  defaultPortfolioId: config.get('resDex.defaultPortfolioId', null)
})

Object.assign(preloadedState.resDex.bootstrapping, {
  isInProgress: config.get('resDex.bootstrappingInProgress', true)
})

const enabledCurrencies = config.get('resDex.enabledCurrencies', RESDEX.alwaysEnabledCurrencies)

Object.assign(preloadedState.resDex.accounts, {
  selectedSymbol: enabledCurrencies[0].symbol,
  enabledCurrencies,
})

