// @flow

// TODO: Refactor this file

import { ipcRenderer } from 'electron'
import React from 'react'
import { connect } from 'react-redux'
import { Switch, Route, Redirect } from 'react-router'
import { bindActionCreators } from 'redux';
import cn from 'classnames'

import Footer from '~/components/get-started/Footer'
import EulaPage from './get-started/EulaPage'
import ChooseLanguagePage from './get-started/ChooseLanguagePage'
import GetStartedPage from './get-started/GetStartedPage'
import CreateNewWalletPage from './get-started/CreateNewWalletPage'
import RestoreYourWalletPage from './get-started/RestoreYourWalletPage'
import ChoosePasswordPage from './get-started/ChoosePasswordPage'
import WelcomePage from './get-started/WelcomePage'

import LoadingPopup from '~/components/LoadingPopup/LoadingPopup'
import Login from '~/components/auth/Login'
import TitleBarButtons, { DragBar } from '~/components/title-bar-buttons/TitleBarButtons'
import NaviBar from './navigation/navi-bar'
import StatusIcons from '~/components/status-icons/StatusIcons'
import SystemInfo from './system-info/system-info'
import Overview from './overview/overview'
import TransactionDetails from '~/components/overview/TransactionDetails'
import OwnAddress from './own-addresses/own-addresses'
import SendCurrency from './send-currency/send-currency'
import Settings from './settings/settings'
import SimplexPage from './SimplexPage'
import DutchAuction from '~/components/DutchAuction/DutchAuction'
import { DutchAuctionActions } from '~/reducers/dutch-auction/dutch-auction.reducer'

import AddressBookPage from './AddressBookPage'

import { getStore } from '../store/configureStore'
import FetchParametersDialog from '~/components/fetch-parameters/FetchParametersDialog'
import { FetchParametersState, FetchParametersActions } from '~/reducers/fetch-parameters/fetch-parameters.reducer'
import { AuthState } from '~/reducers/auth/auth.reducer'
import { GetStartedState } from '~/reducers/get-started/get-started.reducer'
import { SettingsActions } from '~/reducers/settings/settings.reducer'

import styles from './App.scss'
import HLayout from '../assets/styles/h-box-layout.scss'
import VLayout from '../assets/styles/v-box-layout.scss'


type Props = {
  auth: AuthState,
  fetchParameters: FetchParametersState,
  getStarted: GetStartedState,
  dutchAuctionActions: any
}

/**
 * @export
 * @class App
 * @extends {React.Component<Props>}
 */
class App extends React.Component<Props> {
	props: Props

	/**
   * Triggers child processes and binds Resistance parameters download event handlers.
   *
	 * @returns
   * @memberof App
	 */
  componentDidMount() {
    if (!this.props.fetchParameters.isDownloadComplete) {
      getStore().dispatch(FetchParametersActions.fetch())
    } else if (!this.props.getStarted.isInProgress) {
      getStore().dispatch(SettingsActions.kickOffChildProcesses())
    }

    ipcRenderer.on('cleanup', () => this.cleanup())

    this.props.dutchAuctionActions.getAuctionStatus()
  }

  cleanup() {
    getStore().dispatch(SettingsActions.stopChildProcesses())
  }

  getGetStartedContent() {
    return (
      <div className={cn(styles.contentContainer, VLayout.vBoxChild, HLayout.hBoxContainer)}>
        <TitleBarButtons />
        <DragBar />
        <div className={cn(styles.routeContentContainer, HLayout.hBoxChild, HLayout.hBoxContainer)}>
          <Switch>
            <Route exact path="/get-started/eula" component={EulaPage} />
            <Route exact path="/get-started/choose-language" component={ChooseLanguagePage} />
            <Route exact path="/get-started/get-started" component={GetStartedPage} />
            <Route exact path="/get-started/create-new-wallet" component={CreateNewWalletPage} />
            <Route exact path="/get-started/choose-password" component={ChoosePasswordPage} />
            <Route exact path="/get-started/restore-your-wallet" component={RestoreYourWalletPage} />
            <Route exact path="/get-started/welcome" component={WelcomePage} />
            <Route exact path="/" render={() => (<Redirect to="/get-started/eula" />)} />
          </Switch>
        </div>
        <Footer />
      </div>
    )
  }

  getMainContent() {
    return (
      <div className={cn(styles.contentContainer, VLayout.vBoxContainer)}>
				{ /* Content container */}
				<div className={cn(VLayout.vBoxChild, HLayout.hBoxContainer)} style={{overflowY: 'hidden', height: '100%'}}>
          <LoadingPopup />
          <TitleBarButtons />
					<NaviBar />
          <StatusIcons />

					{ /* Route content container */}
					<div className={cn(styles.routeContentContainer, HLayout.hBoxChild, HLayout.hBoxContainer)}>
						<Switch>
							<Route exact path="/" render={() => (<Redirect to="/overview" />)} />

							<Route exact path="/overview" component={Overview} />
              <Route exact path="/overview/transaction-details" component={TransactionDetails} />
							<Route exact path="/own-addresses" component={OwnAddress} />
							<Route exact path="/send-currency" component={SendCurrency} />
							<Route exact path="/settings" component={Settings} />
							<Route exact path="/simplex" component={SimplexPage} />
							<Route exact path="/address-book" component={AddressBookPage} />
							<Route exact path="/dutch-auction" component={DutchAuction} />

						</Switch>
					</div>
				</div>

				<SystemInfo />
      </div>
    )
  }

	/**
   * Renders routes.
   *
	 * @returns
   * @memberof App
	 */
	render() {
    let content

    if (this.props.getStarted.isInProgress) {
      content = this.getGetStartedContent()
    } else if (!this.props.fetchParameters.isDownloadComplete) {
      content = (<FetchParametersDialog />)
    } else {
      content = this.props.auth.isLoginRequired ? (<Login />) : this.getMainContent()
    }

		return (
			<div id="App" className={cn(styles.appContainer, VLayout.vBoxContainer)}>
        {content}
			</div>
		)
	}
}

const mapDispatchToProps = dispatch => ({
  dutchAuctionActions: bindActionCreators(DutchAuctionActions, dispatch),
})

export default connect(state => state, mapDispatchToProps)(App)
