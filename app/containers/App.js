// @flow
import React from 'react'
import { Switch, Route } from 'react-router'
import SytemInfo from './system-info/system-info'
import Overview from './OverviewPage'

import styles from './App.scss'
// import HLayout from '../theme/h-box-layout.scss'
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
				<Switch>
					{
						/*
						<Route path="/own-addresses" component={OwnAddresses} />
						<Route path="/send-cash" component={SendCash} />
						<Route path="/address-book" component={AddressBook} />
						<Route path="/settings" component={Settings} /> 
						<Route exact path="/" component={Overview} />
						*/
					}
					<Route exact path="/" component={Overview} />
					{/* <Route exact path="/" render={() => <Overview />} /> */}
				</Switch>
				<SytemInfo />
			</div>
		)
	}
}
