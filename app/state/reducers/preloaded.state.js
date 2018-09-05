import { userInfo } from 'os'
import { Decimal } from 'decimal.js'

const config = require('electron-settings')


export const preloadedState: State = {
  getStarted: {
    createNewWallet: {
      fields: {
        walletName: userInfo().username
      },
      wallet: null,
      validationErrors: {}
    },
    choosePassword: {
      fields: {},
      validationErrors: {}
    },
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
		lockTips: 'You are sending money from a Transparent (R) Address to a Transparent (R) Address. This transaction will be fully transparent and visible to every user.',
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
	settings: {
		isTorEnabled: false,
		isMinerEnabled: false,
		isStatusModalOpen: false,
		childProcessesStatus: {
			NODE: 'NOT RUNNING',
			MINER: 'NOT RUNNING',
			TOR: 'NOT RUNNING'
		}
	},
	addressBook: {
		records: [],
    newAddressDialog: {
      fields: {},
      validationErrors: {},
      isVisible: false
    }
	}
}

// Load serialized settings
Object.assign(preloadedState.getStarted, {
	isInProgress: config.get('getStartedInProgress', true)
})

Object.assign(preloadedState.settings, {
	isMinerEnabled: config.get('manageDaemon.enableMiner', true),
	isTorEnabled: config.get('manageDaemon.enableTor', false)
})
