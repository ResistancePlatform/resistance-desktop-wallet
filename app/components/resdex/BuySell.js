// @flow
import { Decimal } from 'decimal.js'
import * as Joi from 'joi'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cn from 'classnames'
import { translate } from 'react-i18next'
import ReactTooltip from 'react-tooltip'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import RpcPolling from '~/components/rpc-polling/rpc-polling'
import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import RoundedForm from '~/components/rounded-form/RoundedForm'
import RoundedInputWithUseMax from '~/components/rounded-form/RoundedInputWithUseMax'
import ChooseWallet from '~/components/rounded-form/ChooseWallet'
import OrderSummary from './OrderSummary'

import animatedSpinner from '~/assets/images/animated-spinner.svg'
import styles from './BuySell.scss'

const validationSchema = Joi.object().keys({
  sendFrom: Joi.string().required().label(`Send from`),
  receiveTo: Joi.string().required().label(`Receive to`),
  maxRel: Joi.string().required().label(`Max. amount`),
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

  getMaxQuoteAmount() {
    const { quoteCurrency } = this.props.buySell
    const currency = this.props.accounts.currencies[quoteCurrency]
    return currency && currency.balance || Decimal(0)
  }

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

  getOrder() {
    const form = this.props.roundedForm.resDexBuySell
    const quoteCurrencyAmount = Decimal(form && form.fields.maxRel || '0')

    const { baseCurrency, quoteCurrency, orderBook } = this.props.buySell
    const { price } = orderBook.asks.length && orderBook.asks[0]

    const { enhancedPrivacy } = this.props.buySell

    const order = {
      orderType: 'buy',
      quoteCurrencyAmount,
      price: price || null,
      baseCurrency,
      quoteCurrency,
      enhancedPrivacy,
    }

    return order
  }

	/**
	 * @returns
   * @memberof ResDexBuySell
	 */
	render() {
    const { t } = this.props
    const { baseCurrency, quoteCurrency } = this.props.buySell
    const txFee = this.props.accounts.currencyFees[quoteCurrency]

		return (
      <div className={cn(styles.container)}>
        <RpcPolling
          criticalChildProcess="RESDEX"
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
                  labelClassName={styles.oldInputLabel}
                  defaultValue={quoteCurrency}
                  label={t(`Send from`)}
                  onChange={this.props.actions.updateQuoteCurrency}
                  currencies={this.props.accounts.currencies}
                />

                <ChooseWallet
                  name="receiveTo"
                  labelClassName={styles.oldInputLabel}
                  defaultValue={baseCurrency}
                  label={t(`Receive to`)}
                  onChange={this.props.actions.updateBaseCurrency}
                  currencies={this.props.accounts.currencies}
                />

                <RoundedInputWithUseMax
                  name="maxRel"
                  className={styles.maxRel}
                  labelClassName={styles.inputLabel}
                  label={t(`Max. {{quoteCurrency}}`, { quoteCurrency })}
                  maxAmount={this.getMaxQuoteAmount()}
                  symbol={quoteCurrency}
                  number />

                <div className={styles.enhancedPrivacy}>
                  <label htmlFor="input-resdex-enhanced-privacy-id">
                    <input id="input-resdex-enhanced-privacy-id" type="checkbox" name="enhancedPrivacy" />
                    {t(`Enhanced privacy`)}
                    <i className={styles.info} data-tip={t('enhanced-privacy')} data-for="tooltip-resdex-enhanced-privacy-id" data-offset="{'left': 16}"/>
                    <ReactTooltip id="tooltip-resdex-enhanced-privacy-id" className={cn(styles.tooltip, styles.enhancedPrivacy)}/>
                  </label>
                </div>

                <button
                  type="submit"
                  onClick={this.props.actions.createMarketOrder}
                  disabled={txFee && this.getSubmitButtonDisabledAttribute()}
                >
                  {this.props.buySell.isSendingOrder &&
                    <img src={animatedSpinner} alt={t(`Sending the order...`)} />
                  }
                  {t(`Exchange`)}
                </button>
              </RoundedForm>
            </TabPanel>

            <TabPanel className={styles.tabPanel} />
          </Tabs>


        </div>

        <OrderSummary order={this.getOrder()} />

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
