// @flow
import React from 'react'
import { connect } from 'react-redux'
import { Switch, Route, Redirect } from 'react-router'
import classNames from 'classnames'

import {
  GetStartedPage,
  ChoosePasswordPage,
  RestoreYourWalletPage,
  WelcomePage } from './GetStartedPage'

import CreateNewWalletPage from './get-started/CreateNewWalletPage'

import NaviBar from './navigation/navi-bar'
import TitleBarButtons from '../components/title-bar-buttons/TitleBarButtons'
import SystemInfo from './system-info/system-info'
import Overview from './overview/overview'
import OwnAddress from './own-addresses/own-addresses'
import SendCash from './send-cash/send-cash'
import Settings from './settings/settings'
import AddressBookPage from './AddressBookPage'

import { appStore } from '../state/store/configureStore'
import { GetStartedState } from '../state/reducers/get-started/get-started.reducer'
import { SettingsActions } from '../state/reducers/settings/settings.reducer'

import styles from './App.scss'
import HLayout from '../theme/h-box-layout.scss'
import VLayout from '../theme/v-box-layout.scss'

type Props = {
  getStarted: GetStartedState
}


/**
 * @export
 * @class App
 * @extends {React.Component<Props>}
 */
class App extends React.Component<Props> {
	props: Props;

	/**
   * Triggers child processes.
   *
	 * @returns
   * @memberof App
	 */
  componentDidMount() {
    if (!this.props.getStarted.isInProgress) {
      appStore.dispatch(SettingsActions.kickOffChildProcesses())
    }
  }

	/**
   * Renders routes.
   *
	 * @returns
   * @memberof App
	 */
	render() {
    const getStartedElement = (
      <div className={[styles.contentContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
        <TitleBarButtons />
        <div className={[styles.routeContentContainer, HLayout.hBoxChild, HLayout.hBoxContainer].join(' ')}>
          <Switch>
            <Route exact path="/get-started" component={GetStartedPage} />
            <Route exact path="/get-started/create-new-wallet" component={CreateNewWalletPage} />
            <Route exact path="/get-started/choose-password" component={ChoosePasswordPage} />
            <Route exact path="/get-started/restore-your-wallet" component={RestoreYourWalletPage} />
            <Route exact path="/get-started/welcome" component={WelcomePage} />
            <Route exact path="/" render={() => (<Redirect to="/get-started" />)} />
          </Switch>
        </div>
      </div>
    )

    const mainElement = (
      <div className={classNames(styles.contentContainer, VLayout.vBoxContainer)}>
				{ /* Content container */}
				<div className={[VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
          <TitleBarButtons />
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
				<SystemInfo />
      </div>
    )

		return (
			<div id="App" className={[styles.appContainer, VLayout.vBoxContainer].join(' ')}>
        {this.props.getStarted.isInProgress ? getStartedElement : mainElement }
			</div>
		)
	}
}

export default connect(state => state, null)(App)
