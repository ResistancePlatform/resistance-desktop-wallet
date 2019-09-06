// @flow
import React, { Component } from 'react'
import cn from 'classnames'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import RpcPolling from '~/components/rpc-polling/rpc-polling'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'
import ResDexLogin from './Login'
import InstantDexDepositModal from './InstantDexDepositModal'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'
import AddCurrencyModal from './AddCurrencyModal'
import OrderModal from './OrderModal'
import ResDexAssets from './Assets'
import ResDexBuySell from './BuySell'
import ResDexAdvancedTrading from './AdvancedTrading/AdvancedTrading'
import ResDexOrders from './Orders'
import ResDexAccounts from './Accounts'
import { getIsLoginDisabled } from '~/utils/resdex'
import { Info, BorderlessButton } from '~/components/rounded-form'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './ResDex.scss'
import scrollStyles from '~/assets/styles/scrollbar.scss'

type Props = {
  t: any,
  resDex: ResDexState,
  actions: object,
  loginActions: object
}


/**
 * @class ResDex
 * @extends {Component<Props>}
 */
export class ResDex extends Component<Props> {
	props: Props

  getIsVerified() {
    const { kyc } = this.props.resDex
    return kyc.isRegistered
  }

  getGetVerifiedTooltip() {
    const { t } = this.props

    if (this.getIsVerified()) {
      return null
    }

    return (
      <Info>{t(`Verification required in order to start trading on ResDEX.`)}</Info>
    )
  }

	/**
	 * @returns
   * @memberof ResDex
	 */
  getContents() {
    const { t } = this.props
    const { isExpanded, selectedTabIndex } = this.props.resDex.common
    const isVerified = this.getIsVerified()

    return (
      <div className={cn({[styles.expanded]: isExpanded})}>
        <RpcPolling
          interval={30.0}
          criticalChildProcess="RESDEX"
          actions={{
            polling: ResDexAccountsActions.getCurrencies,
            success: ResDexAccountsActions.gotCurrencies,
            failure: ResDexAccountsActions.getCurrenciesFailed
          }}
        />

        <RpcPolling
          interval={10.0}
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
        {this.props.resDex.accounts.depositModal.isResDex2Visible &&
          <DepositModal resdex2 />
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
          selectedTabPanelClassName={styles.selectedMainTabPanel}
        >
          <TabList className={styles.tabList}>
            <Tab className={styles.tab}>{t(`Assets`)}</Tab>
            <Tab className={styles.tab} disabled={!isVerified}>
              {t(`Buy/Sell`)}
              {this.getGetVerifiedTooltip()}
            </Tab>
            <Tab className={styles.tab} disabled={!isVerified}>
              {t(`Advanced Trading`)}
              {this.getGetVerifiedTooltip()}
            </Tab>
            <Tab className={styles.tab} disabled={!isVerified}>
              {t(`Orders`)}
              {this.getGetVerifiedTooltip()}
            </Tab>
            <Tab className={styles.tab}>{t(`Accounts`)}</Tab>

            {selectedTabIndex === 4 &&
              <BorderlessButton
                className={styles.logoutButton}
                glyphClassName={styles.logoutGlyph}
                onClick={this.props.loginActions.confirmLogout}
                disabled={getIsLoginDisabled(this.props)}
                tooltip={t(`Logout from ResDEX`)}
              />
            }

          </TabList>

          <TabPanel className={cn(styles.tabPanel, scrollStyles.scrollbar, scrollStyles.resdex)}>
            <ResDexAssets />
          </TabPanel>
          <TabPanel className={cn(styles.tabPanel, scrollStyles.scrollbar, scrollStyles.resdex)}>
            <ResDexBuySell />
          </TabPanel>
          <TabPanel className={cn(styles.tabPanel)}>
            <ResDexAdvancedTrading />
          </TabPanel>
          <TabPanel className={cn(styles.tabPanel, scrollStyles.scrollbar, scrollStyles.resdex)}>
            <ResDexOrders />
          </TabPanel>
          <TabPanel className={cn(styles.tabPanel, scrollStyles.scrollbar, scrollStyles.resdex)}>
            <ResDexAccounts />
          </TabPanel>

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

