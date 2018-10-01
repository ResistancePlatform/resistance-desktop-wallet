// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import cn from 'classnames'
import { translate } from 'react-i18next'

import RpcPolling from '~/components/rpc-polling/rpc-polling'
import { OverviewActions } from '~/reducers/overview/overview.reducer'
import { appStore } from '~/store/configureStore'
import Balance from '~/components/overview/Balance'
import TransactionList from '~/components/overview/TransactionList'
import TransactionPopupMenu from '~/components/overview/transaction-popup-menu'
import TransactionDetailList from '~/components/overview/transaction-detail'

import styles from './overview.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'

const walletInfoPollingInterval = 2.0
const transactionsPollingInterval = 5.0

type Props = {
  t: any,
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
	onTransactionRowClickHandler() {
    appStore.dispatch(OverviewActions.updatePopupMenuVisibility(false, -1, -1, ''))
	}

	/**
	 * @param {SyntheticEvent<any>} event
	 * @param {string} transactionId
	 * @memberof Overview
	 */
	onTransactionRowContextMenuHandler(event: SyntheticEvent<any>, transactionId: string) {
    appStore.dispatch(OverviewActions.updatePopupMenuVisibility(true, event.clientX, event.clientY, transactionId))
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
    const { t } = this.props

		const shouldShowTransactionDetail = this.props.overview.transactionDetail !== null
		const renderContent = shouldShowTransactionDetail ? (
			<TransactionDetailList
				transactionDetail={this.props.overview.transactionDetail}
				onBackToTransactionListClick={this.onBackToTransactionListClickHandler}
			/>
		) : (
				<div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer)}>

					<Balance balances={this.props.overview.balances} />

          <div className={cn(styles.transactionsContainer)}>
            <div className={styles.title}>{t(`Transactions`)}</div>

            <TransactionList
              items={this.props.overview.transactions}
              onRowClick={this.onTransactionRowClickHandler}
              onRowContextMenu={this.onTransactionRowContextMenuHandler}
            />
          </div>

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
			<div className={cn(styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer)}>

        <RpcPolling
          interval={walletInfoPollingInterval}
          actions={{
            polling: OverviewActions.getWalletInfo,
            success: OverviewActions.gotWalletInfo,
            failure: OverviewActions.getWalletInfoFailure
          }}
        />

        <RpcPolling
          interval={transactionsPollingInterval}
          actions={{
            polling: OverviewActions.getTransactionDataFromWallet,
            success: OverviewActions.gotTransactionDataFromWallet,
            failure: OverviewActions.getTransactionDataFromWalletFailure
          }}
        />

				{ /* Route content */}
				<div className={cn(styles.overviewContainer, VLayout.vBoxChild, HLayout.hBoxContainer)}>
					{renderContent}
				</div>

			</div>
		)
	}
}


const mapStateToProps = (state) => ({
	overview: state.overview
})

export default connect(mapStateToProps, null)(translate('overview')(Overview))
