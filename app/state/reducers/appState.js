// @flow
import { OSService } from '../../service/os-service'
import { NaviState } from '../reducers/navi/navi.reducer'
import { SystemInfoState } from '../reducers/system-info/system-info.reducer'
import { OverviewState } from '../reducers/overview/overview.reducer'
import { OwnAddressesState } from '../reducers/own-addresses/own-addresses.reducer'
import { SendCashState } from '../reducers/send-cash/send-cash.reducer'
import { SettingsState } from '../reducers/settings/settings.reducer'

const config = require('electron-settings')
const osService = new OSService()

// Set the customized 'electron-settings' path
config.setPath(osService.getAppSettingFile())

export type AppState = {
	navi: NaviState,
	systemInfo: SystemInfoState,
	overview: OverviewState,
	ownAddresses: OwnAddressesState,
	sendCash: SendCashState,
	settings: SettingsState
}

export const preloadedAppState: AppState = {
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
		isTorEnabled: false,
		isMinerEnabled: false
	}
}

// Load serialized settings
Object.assign(preloadedAppState.settings, {
	isMinerEnabled: config.get('manageDaemon.enableMiner', true),
	isTorEnabled: config.get('manageDaemon.enableTor', false)
})
