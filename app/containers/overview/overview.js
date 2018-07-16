// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux';

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
		// appStore.dispatch(OverviewActions.startPollingWalletBalances())
		// appStore.dispatch(OverviewActions.startPollingWalletTransactions())
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
						<TransactionList transactionList={this.props.overview.transactionList} />
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
