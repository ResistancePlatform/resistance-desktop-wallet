// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cn from 'classnames'
import { translate } from 'react-i18next'

import RpcPolling from '~/components/rpc-polling/rpc-polling'
import { BorderlessButton } from '~/components/rounded-form'
import { PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import { OverviewActions } from '~/reducers/overview/overview.reducer'
import Balance from '~/components/overview/Balance'
import TransactionsList from '~/components/overview/TransactionsList'

import styles from './overview.scss'
import scrollStyles from '~/assets/styles/scrollbar.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'

const overviewPopupMenuId = 'overview-row-popup-menu-id'
const walletInfoPollingInterval = 2.0
const transactionsPollingInterval = 5.0

type Props = {
  t: any,
  overview: OverviewState,
  actions: object,
  popupMenu: object
}

/**
 * @class Overview
 * @extends {Component<Props>}
 */
class Overview extends Component<Props> {
	props: Props

	/**
	 * @returns
	 * @memberof Overview
	 */
	render() {
    const { t } = this.props
    const { transactions } = this.props.overview

		return (
			<div className={cn(styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer)}>

        <RpcPolling
          interval={walletInfoPollingInterval}
          criticalChildProcess="NODE"
          actions={{
            polling: OverviewActions.getWalletInfo,
            success: OverviewActions.gotWalletInfo,
            failure: OverviewActions.getWalletInfoFailure
          }}
        />

        <RpcPolling
          interval={transactionsPollingInterval}
          criticalChildProcess="NODE"
          actions={{
            polling: OverviewActions.getTransactionDataFromWallet,
            success: OverviewActions.gotTransactionDataFromWallet,
            failure: OverviewActions.getTransactionDataFromWalletFailure
          }}
        />

				{ /* Route content */}
				<div className={cn(styles.overviewContainer, VLayout.vBoxChild, HLayout.hBoxContainer)}>
          <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer)}>

            <Balance balances={this.props.overview.balances} />

            <div className={cn(styles.transactionsContainer, scrollStyles.scrollbar)}>
              <div className={styles.title}>
                {t(`Transactions`)}

                <BorderlessButton
                  className={styles.exportButton}
                  onClick={this.props.actions.initiateExportToCsv}
                  glyphClassName={styles.glyph}
                  disabled={!transactions || !transactions.length}
                >
                  {t(`Export to .CSV`)}
                </BorderlessButton>

              </div>

              <TransactionsList
                items={transactions}
                onRowClick={(e, transactionId) => this.props.actions.getTransactionDetails(transactionId)}
                onRowContextMenu={(e, transactionId) => this.props.popupMenu.show(overviewPopupMenuId, transactionId, e.clientY, e.clientX)}
              />
            </div>

            <PopupMenu id={overviewPopupMenuId}>
              <PopupMenuItem onClick={(e, transactionId) => this.props.actions.getTransactionDetails(transactionId)}>
                {t(`Show details`)}
              </PopupMenuItem>
              <PopupMenuItem onClick={(e, transactionId) => this.props.actions.copyValue(transactionId)}>
                {t(`Copy value`)}
              </PopupMenuItem>
              <PopupMenuItem onClick={(e, transactionId) => this.props.actions.showInBlockExplorer(transactionId)}>
                {t(`Show in Block Explorer`)}
              </PopupMenuItem>
              <PopupMenuItem onClick={(e, transactionId) => this.props.actions.showMemo(transactionId)}>
                {t(`Show transaction memo`)}
              </PopupMenuItem>
            </PopupMenu>

          </div>
				</div>

			</div>
		)
	}
}


const mapStateToProps = (state) => ({
	overview: state.overview
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(OverviewActions, dispatch),
  popupMenu: bindActionCreators(PopupMenuActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('overview')(Overview))
