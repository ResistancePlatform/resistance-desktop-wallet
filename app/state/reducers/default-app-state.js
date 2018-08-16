import { OSService } from '../../service/os-service'

const config = require('electron-settings')

const osService = new OSService()

// Set the customized 'electron-settings' path
config.setPath(osService.getAppSettingFile())


export const defaultAppState: AppState = {
  rpcPolling: {
    registeredActions: [],
    actionsResponseReceived: {}
  },
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
		miner: {
			hashingPower: 0,
			minedBlocksNumber: 0
		}
	},
	overview: {
		balances: {
			transparentBalance: 0,
			transparentUnconfirmedBalance: 0,
			privateBalance: 0,
			privateUnconfirmedBalance: 0,
			totalBalance: 0,
			totalUnconfirmedBalance: 0
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
		showDropdownMenu: false
	},
	sendCash: {
		isPrivateTransactions: false,
		lockIcon: 'Unlock',
		lockTips: 'You are sending money from a Transparent (R) Address to a Transparent (R) Address. This transaction will be fully transparent and visible to every user.',
		fromAddress: '',
		toAddress: '',
		inputTooltips: '',
		amount: 0,
		currentOperation: null,
		showDropdownMenu: false,
		sendFromRadioButtonType: 'transparent',
		addressList: []
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
		addresses: [],
		showDropdownMenu: false,
		newAddressDialog: null
	}
}

// Load serialized settings
Object.assign(defaultAppState.settings, {
	isMinerEnabled: config.get('manageDaemon.enableMiner', true),
	isTorEnabled: config.get('manageDaemon.enableTor', false)
})
