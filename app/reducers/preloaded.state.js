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
		popupMenu: {
			show: false,
			posX: -1,
			posY: -1,
			popupTransactionId: ''
		},
		transactionDetail: null
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
    newAddressDialog: {
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
    },
    language: 'en'
	},
  resDex: {
    login: {
      isRequired: false,
      portfolios: []
    },
    assets: {
    },
    buySell: {
      isSendingOrder: false,
      baseCurrency: 'HODLC',
      quoteCurrency: 'RES',
      orderBook: {
        baseCurrency: 'HODLC',
        quoteCurrency: 'RES',
        bids: [],
        asks: []
      }
    },
    orders: {
      openOrders: [{
        id: '1',
        time: 1,
        base: 'XBT',
        rel: 'RES',
        amountOut: -1.20014,
        amountIn: 0.01679,
        isPrivate: true,
        status: 'pending'
      }, {
        id: '2',
        time: 1,
        base: 'XBT',
        rel: 'HODL',
        amountOut: -1.20014,
        amountIn: 0.01679,
        isPrivate: false,
        status: 'pending'
      }],
      completedOrders: [{
        id: '1',
        time: 1,
        base: 'XBT',
        rel: 'ETH',
        amountOut: -1.20014,
        amountIn: 0.01679,
        isPrivate: false,
        status: 'matched'
      }, {
        id: '2',
        time: 1,
        base: 'XBT',
        rel: 'HODL',
        amountOut: -1.20014,
        amountIn: 0.01679,
        isPrivate: false,
        status: 'unmatched'
      }],
    },
    accounts: {
      currencies: {},
      enabledCurrencies: [],
      depositModal: {
        isVisible: false,
        symbol: null
      },
      withdrawModal: {
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

Object.assign(preloadedState.resDex.accounts, {
  enabledCurrencies: config.get('resDex.enabledCurrencies', RESDEX.alwaysEnabledCurrencies)
})
