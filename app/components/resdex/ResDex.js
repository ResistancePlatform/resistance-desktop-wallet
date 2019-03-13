// @flow
import React, { Component } from 'react'
import cn from 'classnames'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import RpcPolling from '~/components/rpc-polling/rpc-polling'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexOrdersActions } from '~/reducers/resdex/orders/reducer'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'
import ResDexLogin from './Login'
import InstantDexDepositModal from './InstantDexDepositModal'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'
import AddCurrencyModal from './AddCurrencyModal'
import OrderModal from './OrderModal'
import ResDexAssets from './Assets'
import ResDexBuySell from './BuySell'
import ResDexOrders from './Orders'
import ResDexAccounts from './Accounts'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './ResDex.scss'

type Props = {
  t: any,
  resDex: ResDexState,
  actions: object
}


/**
 * @class ResDex
 * @extends {Component<Props>}
 */
export class ResDex extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof ResDex
	 */
  getContents() {
    const { t } = this.props

    return (
      <div>
        <RpcPolling
          interval={15.0 * 60}
          criticalChildProcess="RESDEX"
          actions={{
            polling: ResDexOrdersActions.kickStartStuckSwaps,
            success: ResDexOrdersActions.kickStartStuckSwapsSucceeded,
            failure: ResDexOrdersActions.kickStartStuckSwapsFailed
          }}
        />

        <RpcPolling
          interval={1.0}
          criticalChildProcess="RESDEX"
          actions={{
            polling: ResDexAccountsActions.getCurrencies,
            success: ResDexAccountsActions.gotCurrencies,
            failure: ResDexAccountsActions.getCurrenciesFailed
          }}
        />

        <RpcPolling
          interval={1.5}
          criticalChildProcess="RESDEX"
          actions={{
            polling: ResDexAccountsActions.getZCredits,
            success: ResDexAccountsActions.gotZCredits,
            failure: ResDexAccountsActions.getZCreditsFailed
          }}
        />

        {this.props.resDex.accounts.instantDexDepositModal.isVisible &&
          <InstantDexDepositModal />
        }
        {this.props.resDex.accounts.depositModal.isVisible &&
          <DepositModal />
        }
        {this.props.resDex.accounts.withdrawModal.isVisible &&
          <WithdrawModal />
        }
        {this.props.resDex.accounts.addCurrencyModal.isVisible &&
          <AddCurrencyModal />
        }
        {this.props.resDex.orders.orderModal.isVisible &&
          <OrderModal />
        }
        <Tabs
          className={styles.tabs}
          selectedIndex={this.props.resDex.common.selectedTabIndex}
          onSelect={tabIndex => this.props.actions.selectTab(tabIndex)}
          selectedTabClassName={styles.selectedTab}
          selectedTabPanelClassName={styles.selectedTabPanel}
        >
          <TabList className={styles.tabList}>
            <Tab className={styles.tab}>{t(`Assets`)}</Tab>
            <Tab className={styles.tab}>{t(`Buy/Sell`)}</Tab>
            <Tab className={styles.tab}>{t(`Orders`)}</Tab>
            <Tab className={styles.tab}>{t(`Accounts`)}</Tab>
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

