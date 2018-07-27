import React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import Root from './containers/Root'
import { configureStore, history } from './state/store/configureStore'
import { AppState } from './state/reducers/appState'
import { OSService } from './service/os-service'
import './app.global.scss'

const config = require('electron-settings')

// Set the customized 'electron-settings' path
const osService = new OSService()
config.setPath(osService.getAppSettingFile())


const initAppState: AppState = {
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
		isMinerEnabled: true
	}
}

Object.assign(initAppState.settings, {
	isMinerEnabled: config.get('manageDaemon.enableMiner', true),
	isTorEnabled: config.get('manageDaemon.enableTor', false)
})

const store = configureStore(initAppState)

render(
	<AppContainer>
		<Root store={store} history={history} />
	</AppContainer>,
	document.getElementById('root')
)

if (module.hot) {
	module.hot.accept('./containers/Root', () => {
		const NextRoot = require('./containers/Root') // eslint-disable-line global-require
		render(
			<AppContainer>
				<NextRoot store={store} history={history} />
			</AppContainer>,
			document.getElementById('root')
		)
	})
}
