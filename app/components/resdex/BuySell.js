// @flow
import log from 'electron-log'
import { Decimal } from 'decimal.js'
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
import {
  Info,
  RoundedForm,
  RoundedButton,
  CheckBox,
  CurrencyAmountInput,
  ChooseWallet
} from '~/components/rounded-form'
import OrderSummary from './OrderSummary'

import styles from './BuySell.scss'

const validationSchema = Joi.object().keys({
  sendFrom: Joi.string().required().label(`Send from`),
  receiveTo: Joi.string().required().label(`Receive to`),
  maxRel: Joi.string().required().label(`Max. amount`),
  enhancedPrivacy: Joi.boolean().required().label(`Enhanced privacy`),
})

type Props = {
  t: any,
  form: object,
  buySell: ResDexState.buySell,
  orders: ResDexState.orders,
  accounts: ResDexState.accounts,
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
    const currency = this.props.accounts.currencies.RESDEX[quoteCurrency]
    return currency && currency.balance || Decimal(0)
  }

  // Can't create a market order if there's no liquidity or when sending an order
  getSubmitButtonDisabledAttribute(order) {
    const { swapHistory } = this.props.orders
    const { baseCurrency, quoteCurrency, orderBook, isSendingOrder } = this.props.buySell

    const arePendingPrivateOrdersPresent = swapHistory.filter(
      swap => swap.isPrivate &&
      !['completed', 'failed'].includes(swap.privacy.status)
    ).length

    log.debug('arePendingPrivateOrdersPresent', arePendingPrivateOrdersPresent)

    const areAllAsksPresent = order.isPrivate
      ? orderBook.resQuote.asks.length && orderBook.baseRes.asks.length
      : orderBook.baseQuote.asks.length

    return (
      isSendingOrder
      || orderBook.baseCurrency !== baseCurrency
      || orderBook.quoteCurrency !== quoteCurrency
      || !areAllAsksPresent
      || arePendingPrivateOrdersPresent
    )

  }

  getOrder() {
    // TODO: Update for private orders
    const { form } = this.props
    const quoteCurrencyAmount = Decimal(form && form.fields.maxRel || '0')

    const { baseCurrency, quoteCurrency, orderBook } = this.props.buySell
    const { asks } = orderBook.baseQuote
    const { price } = asks.length && asks[0]

    const isPrivate = form && form.fields.enhancedPrivacy

    const order = {
      orderType: 'buy',
      quoteCurrencyAmount,
      price: price || null,
      baseCurrency,
      quoteCurrency,
      isPrivate,
    }

    return order
  }

  getForm(isAdvanced: boolean, order: object) {
    const { t } = this.props
    const { baseCurrency, quoteCurrency } = this.props.buySell
    const txFee = this.props.accounts.currencyFees[quoteCurrency]

    return (
      <RoundedForm
              id={isAdvanced ? 'resDexBuySellAdvanced' : 'resDexBuySellSimple'}
              schema={validationSchema}
            >
        <ChooseWallet
          name="sendFrom"
          labelClassName={styles.oldInputLabel}
          defaultValue={quoteCurrency}
          label={t(`Send from`)}
          onChange={this.props.actions.updateQuoteCurrency}
          currencies={this.props.accounts.currencies.RESDEX}
        />

        <ChooseWallet
          name="receiveTo"
          labelClassName={styles.oldInputLabel}
          defaultValue={baseCurrency}
          label={t(`Receive to`)}
          onChange={this.props.actions.updateBaseCurrency}
          currencies={this.props.accounts.currencies.RESDEX}
        />

        {isAdvanced ? (
            <div className={styles.advanced}>
              <CurrencyAmountInput
                name="maxRel"
                addonClassName={styles.maxRelAddon}
                buttonLabel={t(`Use max`)}
                maxAmount={this.getMaxQuoteAmount()}
                symbol={quoteCurrency}
              />

            </div>
          ) : (
            <div className={styles.simple}>
              <CurrencyAmountInput
                name="maxRel"
                labelClassName={styles.inputLabel}
                addonClassName={styles.maxRelAddon}
                label={t(`Max. {{quoteCurrency}}`, { quoteCurrency })}
                buttonLabel={t(`Use max`)}
                maxAmount={this.getMaxQuoteAmount()}
                symbol={quoteCurrency}
              />

              <CheckBox name="enhancedPrivacy" defaultValue={false}>
                {t(`Enhanced privacy`)}

                <Info
                  tooltipClassName={styles.enhancedPrivacyTooltip}
                  tooltip={t('enhanced-privacy')}
                />

              </CheckBox>

            </div>
          )
        }

        <RoundedButton
          type="submit"
          className={styles.exchangeButton}
          onClick={
            order.isPrivate
            ? this.props.actions.createPrivateOrder
            : this.props.actions.createOrder
          }
          disabled={txFee && this.getSubmitButtonDisabledAttribute(order)}
          spinner={this.props.buySell.isSendingOrder}
          spinnerTooltip={t(`Sending the order...`)}
          important
          large
        >
          {isAdvanced ? t(`Add to order book`) : t(`Exchange`)}
        </RoundedButton>
      </RoundedForm>
    )

  }

	/**
	 * @returns
   * @memberof ResDexBuySell
	 */
	render() {
    const { t } = this.props
    const order = this.getOrder()

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
              <Tab className={styles.tab}>{t(`Advanced`)}</Tab>
            </TabList>

            <TabPanel className={styles.tabPanel}>
              {this.getForm(false, order)}
            </TabPanel>

            <TabPanel className={styles.tabPanel}>
              {this.getForm(true, order)}
            </TabPanel>
          </Tabs>


        </div>

        <OrderSummary order={order} />

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  form: state.roundedForm.resDexBuySell,
	buySell: state.resDex.buySell,
	orders: state.resDex.orders,
	accounts: state.resDex.accounts,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexBuySellActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ResDexBuySell))
