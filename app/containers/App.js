// @flow

import React from 'react'
import { connect } from 'react-redux'
import { Switch, Route, Redirect } from 'react-router'
import cn from 'classnames'

import Footer from '~/components/get-started/Footer'
import ChooseLanguagePage from './get-started/ChooseLanguagePage'
import GetStartedPage from './get-started/GetStartedPage'
import CreateNewWalletPage from './get-started/CreateNewWalletPage'
import RestoreYourWalletPage from './get-started/RestoreYourWalletPage'
import ChoosePasswordPage from './get-started/ChoosePasswordPage'
import WelcomePage from './get-started/WelcomePage'

import Login from '~/components/auth/Login'
import TitleBarButtons, { DragBar } from '~/components/title-bar-buttons/TitleBarButtons'
import NaviBar from './navigation/navi-bar'
import StatusIcons from '~/components/status-icons/StatusIcons'
import SystemInfo from './system-info/system-info'
import Overview from './overview/overview'
import OwnAddress from './own-addresses/own-addresses'
import SendCash from './send-cash/send-cash'
import Settings from './settings/settings'
import ResDexPage from './ResDexPage'
import ResDexStart from '~/components/resdex/bootstrapping/Start'
import ResDexCreatePortfolio from '~/components/resdex/bootstrapping/CreatePortfolio'
import ResDexSaveSeed from '~/components/resdex/bootstrapping/SaveSeed'
import ResDexEnterSeed from '~/components/resdex/bootstrapping/EnterSeed'
import ResDexForgotPassword from '~/components/resdex/bootstrapping/ForgotPassword'

import AddressBookPage from './AddressBookPage'

import { getStore } from '../store/configureStore'
import FetchParametersDialog from '~/components/fetch-parameters/FetchParametersDialog'
import { FetchParametersState, FetchParametersActions } from '~/reducers/fetch-parameters/fetch-parameters.reducer'
import { AuthState } from '~/reducers/auth/auth.reducer'
import { GetStartedState } from '~/reducers/get-started/get-started.reducer'
import { SettingsActions } from '~/reducers/settings/settings.reducer'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'

import styles from './App.scss'
import HLayout from '../assets/styles/h-box-layout.scss'
import VLayout from '../assets/styles/v-box-layout.scss'


type Props = {
  auth: AuthState,
  fetchParameters: FetchParametersState,
  getStarted: GetStartedState,
  resDex: ResDexState
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
  }

  getGetStartedContent() {
    return (
      <div className={cn(styles.contentContainer, VLayout.vBoxChild, HLayout.hBoxContainer)}>
        <TitleBarButtons />
        <DragBar />
        <div className={cn(styles.routeContentContainer, HLayout.hBoxChild, HLayout.hBoxContainer)}>
          <Switch>
            <Route exact path="/get-started/choose-language" component={ChooseLanguagePage} />
            <Route exact path="/get-started/get-started" component={GetStartedPage} />
            <Route exact path="/get-started/create-new-wallet" component={CreateNewWalletPage} />
            <Route exact path="/get-started/choose-password" component={ChoosePasswordPage} />
            <Route exact path="/get-started/restore-your-wallet" component={RestoreYourWalletPage} />
            <Route exact path="/get-started/welcome" component={WelcomePage} />
            <Route exact path="/" render={() => (<Redirect to="/get-started/choose-language" />)} />
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
				<div className={cn(VLayout.vBoxChild, HLayout.hBoxContainer)}>
          <TitleBarButtons />
					<NaviBar />
          <StatusIcons />

					{ /* Route content container */}
					<div className={cn(styles.routeContentContainer, HLayout.hBoxChild, HLayout.hBoxContainer)}>
						<Switch>
							<Route exact path="/" render={() => (<Redirect to="/overview" />)} />

							<Route exact path="/overview" component={Overview} />
							<Route exact path="/own-addresses" component={OwnAddress} />
							<Route exact path="/send-cash" component={SendCash} />
							<Route exact path="/settings" component={Settings} />
							<Route exact path="/address-book" component={AddressBookPage} />

              <Route exact path="/resdex" render={() => (
                this.props.resDex.bootstrapping.isInProgress
                  ? (<ResDexStart />)
                  : (<ResDexPage />)
              )} />

              <Route exact path="/resdex/start" component={ResDexStart} />
              <Route exact path="/resdex/restore-portfolio" component={ResDexEnterSeed} />
              <Route exact path="/resdex/create-portfolio" component={ResDexCreatePortfolio} />
              <Route exact path="/resdex/save-seed" component={ResDexSaveSeed} />
              <Route exact path="/resdex/confirm-seed" component={ResDexEnterSeed} />
              <Route exact path="/resdex/forgot-password" component={ResDexForgotPassword} />
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

export default connect(state => state, null)(App)
