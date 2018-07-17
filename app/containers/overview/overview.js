// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux';
import { OverviewActions } from '../../state/reducers/overview/overview.reducer'
import { appStore } from '../../state/store/configureStore'
import Balance from '../../components/overview/Balance'
import TransactionList from '../../components/overview/TransactionList'
import styles from './overview.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'


type Props = {
	overview: OverviewState
}

/**
 * @class Overview
 * @extends {Component<Props>}
 */
class Overview extends Component<Props> {
	props: Props

	/**
	 * @memberof Overview
	 */
	componentDidMount() {
		appStore.dispatch(OverviewActions.startGettingWalletInfo())
		appStore.dispatch(OverviewActions.startGettingTransactionDataFromWallet())
	}

	/**
	 * @memberof Overview
	 */
	componentWillUnmount() {
		appStore.dispatch(OverviewActions.stopGettingWalletInfo())
		appStore.dispatch(OverviewActions.stopGettingTransactionDataFromWallet())
	}

	/**
	 * @returns
	 * @memberof Overview
	 */
	render() {
		return (
			// Layout container
			<div className={[styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}>

				{ /* Route content */}
				<div className={[styles.overviewContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>

					<div className={[HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}>
						<Balance balances={this.props.overview.balances} />
						<TransactionList transactions={this.props.overview.transactions} />
					</div>
				</div>

				{/* Fixed bottom status bar */}

			</div>
		)
	}
}


const mapStateToProps = (state) => ({
	overview: state.overview
})

export default connect(mapStateToProps, null)(Overview);
