// @flow
import React from 'react'
import { Switch, Route, Redirect } from 'react-router'

import NaviBar from './navigation/navi-bar'
import SytemInfo from './system-info/system-info'
import Overview from './overview/overview'
import OwnAddress from './own-addresses/own-addresses'
import SendCash from './send-cash/send-cash'
import Settings from './settings/settings'
import AddressBookPage from './AddressBookPage'

import styles from './App.scss'
import HLayout from '../theme/h-box-layout.scss'
import VLayout from '../theme/v-box-layout.scss'

import { appStore } from '../state/store/configureStore'
import { SettingsActions } from '../state/reducers/settings/settings.reducer'

type Props = {};


/**
 * @export
 * @class App
 * @extends {React.Component<Props>}
 */
export default class App extends React.Component<Props> {
	props: Props;

  componentDidMount() {
    const settings = appStore.getState().settings

    const startNode = () => {
      appStore.dispatch(SettingsActions.startLocalNode())
    }

    const startMiner = () => {
      appStore.dispatch(SettingsActions.enableMiner())
    }

    if (settings.isTorEnabled) {
      appStore.dispatch(SettingsActions.enableTor())
      setTimeout(startNode, 200);
    } else {
      startNode()
    }

    if (settings.isMinerEnabled) {
      setTimeout(startMiner, 1000);
    }
  }

	render() {
		return (
			<div id="App" className={[styles.appContainer, VLayout.vBoxContainer].join(' ')}>
				{ /* Content container */}
				<div className={[styles.contentContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
					<NaviBar />

					{ /* Route content container */}
					<div className={[styles.routeContentContainer, HLayout.hBoxChild, HLayout.hBoxContainer].join(' ')}>
						<Switch>
							<Route exact path="/overview" component={Overview} />
							<Route exact path="/own-addresses" component={OwnAddress} />
							<Route exact path="/send-cash" component={SendCash} />
							<Route exact path="/settings" component={Settings} />
							<Route exact path="/address-book" component={AddressBookPage} />
							<Route exact path="/" render={() => (<Redirect to="/overview" />)} />
						</Switch>
					</div>
				</div>

				{ /* System info bar */}
				<SytemInfo />
			</div>
		)
	}
}
