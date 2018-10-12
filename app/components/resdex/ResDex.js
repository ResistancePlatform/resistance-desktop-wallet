// @flow
import React, { Component } from 'react'
import cn from 'classnames'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import RpcPolling from '~/components/rpc-polling/rpc-polling'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'
import ResDexLogin from './Login'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'
import ResDexAssets from './Assets'
import ResDexBuySell from './BuySell'
import ResDexOrders from './Orders'
import ResDexAccounts from './Accounts'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './ResDex.scss'

type Props = {
  resDex: ResDexState,
  ordersActions: object
}


/**
 * @class ResDex
 * @extends {Component<Props>}
 */
export class ResDex extends Component<Props> {
	props: Props

	/**
   * Initiates swap history fetching.
   *
	 * @returns
   * @memberof ResDex
	 */
  componentDidMount() {
    this.props.ordersActions.initSwapHistory()
  }

	/**
	 * @returns
   * @memberof ResDex
	 */
  getContents() {
    /*
    <RpcPolling
      interval={15.0 * 60}
      criticalChildProcess="RESDEX"
      actions={{
        polling: ResDexOrdersActions.kickStartStuckSwaps,
        success: ResDexAccountsActions.kickStartStuckSwapsSucceeded,
        failure: ResDexAccountsActions.kickStartStuckSwapsFailed
      }}
    />
    */

    return (
      <div>
        <RpcPolling
          interval={1.0}
          criticalChildProcess="RESDEX"
          actions={{
            polling: ResDexAccountsActions.getCurrencies,
            success: ResDexAccountsActions.gotCurrencies,
            failure: ResDexAccountsActions.getCurrenciesFailed
          }}
        />

        {this.props.resDex.accounts.depositModal.isVisible &&
          <DepositModal />
        }
        {this.props.resDex.accounts.withdrawModal.isVisible &&
          <WithdrawModal />
        }

        <Tabs
          className={styles.tabs}
          selectedTabClassName={styles.selectedTab}
          selectedTabPanelClassName={styles.selectedTabPanel}
        >
          <TabList className={styles.tabList}>
            <Tab className={styles.tab}>Assets</Tab>
            <Tab className={styles.tab}>Buy/Sell</Tab>
            <Tab className={styles.tab}>Orders</Tab>
            <Tab className={styles.tab}>Accounts</Tab>
          </TabList>

          <TabPanel><ResDexAssets /></TabPanel>
          <TabPanel><ResDexBuySell /></TabPanel>
          <TabPanel><ResDexOrders /></TabPanel>
          <TabPanel><ResDexAccounts /></TabPanel>

        </Tabs>
    </div>
    )
  }

	/**
	 * @returns
   * @memberof ResDex
	 */
	render() {
    return (
      <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, styles.resDexContainer)}>
        <div className={styles.dragBar} />

        {this.props.resDex.login.isRequired
          ?  <ResDexLogin />
          : this.getContents()
        }

      </div>
    )
  }
}

