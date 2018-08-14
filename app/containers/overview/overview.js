// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux';

import { OverviewActions } from '../../state/reducers/overview/overview.reducer'
import { appStore } from '../../state/store/configureStore'
import Balance from '../../components/overview/Balance'
import TransactionList from '../../components/overview/transaction-list'
import TransactionPopupMenu from '../../components/overview/transaction-popup-menu'
import TransactionDetailList from '../../components/overview/transaction-detail'
import styles from './overview.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'


type Props = {
  overview: OverviewState,
  settings: SettingsState
}

/**
 * @class Overview
 * @extends {Component<Props>}
 */
class Overview extends Component<Props> {
	props: Props
  isLocalNodePollingStarted: boolean

	/**
	 * @memberof Overview
	 */
	componentDidMount() {
    this.isLocalNodePollingStarted = false
    this.checkLocalNodeStatusAndStartPolling()
	}

	/**
	 * @param {*} nextProps
	 * @memberof Overview
	 */
  componentDidUpdate() {
    this.checkLocalNodeStatusAndStartPolling()
  }

	/**
	 * @memberof Overview
	 */
	componentWillUnmount() {
    this.isLocalNodePollingStarted = false
		appStore.dispatch(OverviewActions.stopGettingWalletInfo())
		appStore.dispatch(OverviewActions.stopGettingTransactionDataFromWallet())
	}

	/**
	 * @memberof Overview
	 */
  checkLocalNodeStatusAndStartPolling() {
    if (!this.isLocalNodePollingStarted && this.props.settings.childProcessesStatus.NODE === 'RUNNING') {
      this.isLocalNodePollingStarted = true
      appStore.dispatch(OverviewActions.startGettingWalletInfo())
      appStore.dispatch(OverviewActions.startGettingTransactionDataFromWallet())
    }
  }

	/**
	 * @param {*} event
	 * @param {string} transactionId
	 * @memberof Overview
	 */
	onTransactionRowClickHandler(event: any, transactionId: string) {
		if (event.type === 'contextmenu') {
			appStore.dispatch(OverviewActions.updatePopupMenuVisibility(true, event.clientX, event.clientY, transactionId))
		} else {
			appStore.dispatch(OverviewActions.updatePopupMenuVisibility(false, -1, -1, ''))
		}
	}

	/**
	 * @param {string} name
	 * @memberof Overview
	 */
	onMenuItemClickedHandler(name: string) {
		switch (name) {
			case "COPY_VALUE": {
				break
			}
			case "EXPORT_DATA_TO_.CSV": {
				break
			}
			case "SHOW_DETAILS": {
				appStore.dispatch(OverviewActions.showTransactionDetail())
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

		appStore.dispatch(OverviewActions.updatePopupMenuVisibility(false, -1, -1, ''))
	}

	/**
	 * @memberof Overview
	 */
	onBackToTransactionListClickHandler() {
		appStore.dispatch(OverviewActions.backToTransactionList())
	}

	/**
	 * @returns
	 * @memberof Overview
	 */
	render() {
		const shouldShowTransactionDetail = this.props.overview.transactionDetail !== null
		const renderContent = shouldShowTransactionDetail ? (
			<TransactionDetailList
				transactionDetail={this.props.overview.transactionDetail}
				onBackToTransactionListClick={this.onBackToTransactionListClickHandler}
			/>
		) : (
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
			)

		return (
			// Layout container
			<div className={[styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}>

				{ /* Route content */}
				<div className={[styles.overviewContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
					{renderContent}
				</div>

			</div>
		)
	}
}


const mapStateToProps = (state) => ({
	overview: state.overview,
	settings: state.settings
})

export default connect(mapStateToProps, null)(Overview);
