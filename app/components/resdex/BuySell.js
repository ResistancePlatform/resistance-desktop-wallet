// @flow
import * as Joi from 'joi'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cn from 'classnames'
import { translate } from 'react-i18next'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import RpcPolling from '~/components/rpc-polling/rpc-polling'
import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import RoundedForm from '~/components/rounded-form/RoundedForm'
import RoundedInput from '~/components/rounded-form/RoundedInput'
import ChooseWallet from '~/components/rounded-form/ChooseWallet'
import CurrencyIcon from './CurrencyIcon'

import styles from './BuySell.scss'

const validationSchema = Joi.object().keys({
  sendFrom: Joi.string().required().label(`Send from`),
  receiveTo: Joi.string().required().label(`Receive to`),
  maxRel: Joi.number().required().label(`Max. amount`),
})

type Props = {
  t: any,
  roundedForm: object,
  accounts: ResDexState.accounts,
  buySell: ResDexState.buySell,
  actions: object
}


/**
 * @class ResDexBuySell
 * @extends {Component<Props>}
 */
class ResDexBuySell extends Component<Props> {
	props: Props

  // Can't create a market order if there's no liquidity or when sending an order
  getSubmitButtonDisabledAttribute() {
    const { baseCurrency, quoteCurrency, orderBook, isSendingOrder } = this.props.buySell

    return (
      isSendingOrder
      || orderBook.baseCurrency !== baseCurrency
      || orderBook.quoteCurrency !== quoteCurrency
      || orderBook.asks.length === 0
    )

  }

	/**
	 * @returns
   * @memberof ResDexBuySell
	 */
	render() {
    const { t } = this.props
    const form = this.props.roundedForm.resDexBuySell
    const { orderBook } = this.props.buySell

		return (
      <div className={cn(styles.container)}>
        <RpcPolling
          interval={1.0}
          actions={{
            polling: ResDexBuySellActions.getOrderBook,
            success: ResDexBuySellActions.gotOrderBook,
            failure: ResDexBuySellActions.getOrderBookFailed
          }}
        />

        <div className={styles.actionContainer}>
          <Tabs
            className={styles.tabs}
            selectedTabClassName={styles.selectedTab}
            selectedTabPanelClassName={styles.selectedTabPanel}
          >
            <TabList className={styles.tabList}>
              <Tab className={styles.tab}>{t(`Simple`)}</Tab>
              <Tab className={styles.tab} disabled>{t(`Advanced`)}</Tab>
            </TabList>

            <TabPanel className={styles.tabPanel}>
              <RoundedForm
                id="resDexBuySell"
                schema={validationSchema}
              >
                <ChooseWallet
                  name="sendFrom"
                  defaultValue={this.props.buySell.quoteCurrency}
                  label={t(`Send from`)}
                  currencies={this.props.accounts.currencies}
                />

                <ChooseWallet
                  name="receiveTo"
                  defaultValue={this.props.buySell.baseCurrency}
                  label={t(`Receive to`)}
                  currencies={this.props.accounts.currencies}
                />

                <RoundedInput
                  className={styles.maxRel}
                  label={t(`Max. {{symbol}}`, { symbol: this.props.buySell.quoteCurrency })}
                  name="maxRel"
                  number />

                <div className={styles.enhancedPrivacy}>
                  <label htmlFor="enhancedPrivacyInputId">
                    <input id="enhancedPrivacyInputId" type="checkbox" name="enhancedPrivacy" />
                    {t(`Enhanced privacy`)}
                    <i className={styles.info} />
                  </label>
                </div>

                <button
                  type="submit"
                  onClick={this.props.actions.createMarketOrder}
                  disabled={this.getSubmitButtonDisabledAttribute()}
                >
                  {t(`Exchange`)}
                </button>
              </RoundedForm>
            </TabPanel>

            <TabPanel className={styles.tabPanel} />
          </Tabs>


        </div>

        <div className={styles.summaryContainer}>
          <div className={styles.briefContainer}>
            <div className={styles.brief}>{t(`You are sending`)}</div>

            <div className={styles.amount}>
              {form && form.fields.maxRel || '0'} <span>{form && form.fields.sendFrom }</span>
            </div>

            <div className={styles.at}>
              {orderBook.asks.length
                ? `@ X ${this.props.buySell.baseCurrency} per ${this.props.buySell.quoteCurrency}`
                : t(`No liquidity available yet`)
              }

            </div>

          </div>

          <div className={styles.fromTo}>
            <div className={styles.wallet}>
              <CurrencyIcon symbol="BTC" size="1.24rem" />
              <div>
                <span>Send</span>
                BTC Wallet
              </div>
            </div>

            <div className={cn('icon', styles.exchangeIcon)} />

            <div className={styles.wallet}>
              <CurrencyIcon symbol="ETH" size="1.24rem" />
              <div>
                <span>Receive</span>
                ETH Wallet
              </div>
            </div>

          </div>

          <ul className={styles.list}>
            <li className={styles.res}>
              1.01679 BTC
              <hr />
              <span>24.69 ETH</span>
            </li>
            <li>
              {t(`DEX Fee`)}
              <hr />
              <span>0.15%</span>
            </li>
            <li>
              {t(`RES Fee`)}
              <hr />
              <span>0.10%</span>
            </li>
            <li>
              {t(`Max. Total Payout`)}
              <hr />
              <span>25.26 ETH</span>
            </li>
          </ul>

        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
	roundedForm: state.roundedForm,
	buySell: state.resDex.buySell,
	accounts: state.resDex.accounts,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexBuySellActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ResDexBuySell))
