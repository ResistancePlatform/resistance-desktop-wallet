// @flow
import React from 'react'
import { Switch, Route, Redirect } from 'react-router'
import NaviBar from './navigation/navi-bar'
import SytemInfo from './system-info/system-info'
import Overview from './overview/overview'
import OwnAddress from './own-addresses/own-addresses'
import SendCash from './send-cash/send-cash'

import styles from './App.scss'
import HLayout from '../theme/h-box-layout.scss'
import VLayout from '../theme/v-box-layout.scss'


type Props = {};


/**
 * @export
 * @class App
 * @extends {React.Component<Props>}
 */
export default class App extends React.Component<Props> {
	props: Props;

	render() {
		return (
			<div id="App" className={[styles.appContainer, VLayout.vBoxContainer].join(' ')}>
				{ /* Content container */}
				<div className={[styles.contentContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
					<NaviBar />

					{ /* Route content container */}
					<div className={[styles.routeContentContainer, HLayout.hBoxChild, HLayout.hBoxContainer].join(' ')}>
						<Switch>
							{
								/*
								<Route path="/address-book" component={AddressBook} />
								<Route path="/settings" component={Settings} /> 
								<Route exact path="/" component={Overview} />
								*/
							}
							<Route exact path="/overview" component={Overview} />
							<Route exact path="/own-addresses" component={OwnAddress} />
							<Route exact path="/send-cash" component={SendCash} />
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
