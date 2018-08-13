// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux';
import { OverviewActions } from '../../state/reducers/overview/overview.reducer'
import { appStore } from '../../state/store/configureStore'
import Balance from '../../components/overview/Balance'
import TransactionList from '../../components/overview/TransactionList'
import TransactionPopupMenu from '../../components/overview/transaction-popup-menu'
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

	onTransactionRowClickHandler(event: any, transactionId: string) {
		if (event.type === 'contextmenu') {
			appStore.dispatch(OverviewActions.updatePopupMenuVisibility(true, event.clientX, event.clientY, transactionId))
		} else {
			appStore.dispatch(OverviewActions.updatePopupMenuVisibility(false, -1, -1, ''))
		}
	}

	onMenuItemClickedHandler(name: string) {
		appStore.dispatch(OverviewActions.updatePopupMenuVisibility(false, -1, -1, ''))
		console.log(`onMenuItemClickedHandler - name: ${name}`)

		switch (name) {
			case "COPY_VALUE": {
				break
			}
			case "EXPORT_DATA_TO_.CSV": {
				break
			}
			case "SHOW_DETAILS": {
				break
			}
			case "SHOW_IN_BLOCK_EXPLORER": {
				break
			}
			case "SHOW_TRANSACTION_MEMO": {
				break
			}
			default: {
				break
			}
		}
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
						<TransactionList
							transactions={this.props.overview.transactions}
							onTransactionRowClick={this.onTransactionRowClickHandler}
						/>
						<TransactionPopupMenu
							show={this.props.overview.popupMenu.show}
							posX={this.props.overview.popupMenu.posX ? this.props.overview.popupMenu.posX : -1}
							posY={this.props.overview.popupMenu.posY ? this.props.overview.popupMenu.posY : -1}
							onMenuItemClicked={this.onMenuItemClickedHandler}
						/>
					</div>
				</div>

			</div>
		)
	}
}


const mapStateToProps = (state) => ({
	overview: state.overview
})

export default connect(mapStateToProps, null)(Overview);
