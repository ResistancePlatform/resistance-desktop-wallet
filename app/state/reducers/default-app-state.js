import { OSService } from '../../service/os-service'

const config = require('electron-settings')

const osService = new OSService()

// Set the customized 'electron-settings' path
config.setPath(osService.getAppSettingFile())


export const defaultAppState: AppState = {
	navi: {
		currentNaviPath: '/overview'
	},
	systemInfo: {
		daemonInfo: {
			status: `NOT_RUNNING`,
			residentSizeMB: 0
		},
		blockChainInfo: {
			connectionCount: 0,
			blockchainSynchronizedPercentage: 0,
			lastBlockDate: null
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
		transactions: []
	},
	ownAddresses: {
		addresses: [],
		showDropdownMenu: false
	},
	sendCash: {
		isPrivateSendOn: false,
		fromAddress: '',
		toAddress: '',
		amount: 0,
		currentOperation: null,
		showDropdownMenu: false,
		sendFromRadioButtonType: 'transparent',
		addressList: []
	},
	settings: {
		isDaemonUpdating: false,
		isTorUpdating: false,
		isMinerUpdating: false,
		isTorEnabled: config.get('manageDaemon.enableTor', false),
		isMinerEnabled: config.get('manageDaemon.enableMiner', true),
	}
}

// Load serialized settings
Object.assign(defaultAppState.settings, {
	isMinerEnabled: config.get('manageDaemon.enableMiner', true),
	isTorEnabled: config.get('manageDaemon.enableTor', false)
})
