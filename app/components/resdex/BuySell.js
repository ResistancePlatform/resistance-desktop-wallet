// @flow
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
import { RoundedFormActions } from '~/reducers/rounded-form/rounded-form.reducer'
import {
  Info,
  RoundedForm,
  RoundedButton,
  CheckBox,
  RadioButton,
  CurrencyAmountInput,
  PriceInput,
  ChooseWallet
} from '~/components/rounded-form'
import OrderSummary from './OrderSummary'
import OrderBook from './OrderBook'

import styles from './BuySell.scss'

const validationSchema = Joi.object().keys({
  isMarketOrder: Joi.boolean().default(false),
  sendFrom: Joi.string().required().label(`Send from`),
  receiveTo: Joi.string().required().label(`Receive to`),
  maxRel: Joi.string().required().label(`Max. amount`),
  price: Joi.string().optional().label(`Price`),
  enhancedPrivacy: Joi.boolean().default(false).label(`Enhanced privacy`),
})

type Props = {
  t: any,
  form: object,
  buySell: ResDexState.buySell,
  orders: ResDexState.orders,
  accounts: ResDexState.accounts,
  actions: object,
  formActions: object
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

  getBestPrice(): object | null {
    const { orderBook } = this.props.buySell
    const { asks  } = orderBook.baseQuote
    return asks.length ? asks[0].price : null
  }

  // Can't create a market order if there's no liquidity or when sending an order
  getSubmitButtonDisabledAttribute(order) {
    const { swapHistory } = this.props.orders
    const { baseCurrency, quoteCurrency, orderBook, isSendingOrder } = this.props.buySell

    if (!order.isMarket) {
      return isSendingOrder
    }

    const arePendingPrivateOrdersPresent = swapHistory.filter(
      swap => swap.isPrivate &&
      !['completed', 'failed'].includes(swap.privacy.status)
    ).length

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
    const { form } = this.props
    const quoteCurrencyAmount = Decimal(form && form.fields.maxRel || '0')

    const { baseCurrency, quoteCurrency, orderBook } = this.props.buySell
    const { asks } = orderBook.baseQuote
    const { price } = asks.length && asks[0]
    const { isAdvanced } = this.props.buySell

    const isPrivate = form && form.fields.enhancedPrivacy
    const isMarket = form && form.fields.isMarketOrder || !isAdvanced

    const order = {
      orderType: 'buy',
      quoteCurrencyAmount,
      price: price || null,
      baseCurrency,
      quoteCurrency,
      isMarket,
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
        id="resDexBuySell"
        className={styles.form}
        schema={validationSchema}
      >

        {isAdvanced &&
          <div className={styles.orderType}>
            <div className={styles.caption}>
              {t(`Order type`)}
            </div>

            <RadioButton
              name="isMarketOrder"
              value
              defaultValue={false}
            >
              {t(`Market Order`)}
            </RadioButton>

            <RadioButton
              name="isMarketOrder"
              value={false}
              defaultChecked
              defaultValue={false}
            >
              {t(`Limit Order`)}
            </RadioButton>
          </div>
        }
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
            <div className={styles.advancedInputs}>
              <div className={styles.box}>
                <div className={styles.caption}>
                  {t(`Max. {{symbol}}`, {symbol: quoteCurrency})}
                  <Info tooltip={t(`Lorem ipsum`)} />
                </div>

                <CurrencyAmountInput
                  name="maxRel"
                  buttonLabel={t(`Use max`)}
                  addonClassName={styles.maxRelAddon}
                  maxAmount={this.getMaxQuoteAmount()}
                  symbol={quoteCurrency}
                />

              </div>

              <div className={styles.box}>
                <div className={styles.caption}>
                  {t(`Price {{symbol}}`, {symbol: quoteCurrency})}
                  <Info tooltip={t(`Lorem ipsum`)} />
                </div>

                <PriceInput
                  name="price"
                  bestPrice={this.getBestPrice()}
                  baseCurrency={baseCurrency}
                  quoteCurrency={quoteCurrency}
                />

              </div>

            </div>
          ) : (
            <div className={styles.simple}>
              <CurrencyAmountInput
                name="maxRel"
                labelClassName={styles.inputLabel}
                label={t(`Max. {{quoteCurrency}}`, { quoteCurrency })}
                addonClassName={styles.maxRelAddon}
                buttonLabel={t(`Use max`)}
                maxAmount={this.getMaxQuoteAmount()}
                symbol={quoteCurrency}
              />

            </div>
          )
        }
        {order.isMarket &&
          <CheckBox name="enhancedPrivacy" defaultValue={false}>
            {t(`Enhanced privacy`)}

            <Info
              tooltipClassName={styles.enhancedPrivacyTooltip}
              tooltip={t('enhanced-privacy')}
            />

          </CheckBox>
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
          {order.isMarket ? t(`Exchange`) : t(`Add to order book`)}
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
    const { baseCurrency, quoteCurrency } = this.props.buySell
    const { RESDEX: currencies } = this.props.accounts.currencies

    const baseSmartAddress = baseCurrency in currencies ? currencies[baseCurrency].address : null
    const quoteSmartAddress = quoteCurrency in currencies ? currencies[quoteCurrency].address : null

		return (
      <div className={cn(styles.container)}>

        <div className={styles.topContainer}>
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
              selectedIndex={this.props.buySell.selectedTabIndex}
              onSelect={tabIndex => this.props.actions.selectTab(tabIndex)}
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

          <div className={styles.orderSummaryContainer}>
            <OrderSummary order={order} />
          </div>
        </div>

        {this.props.buySell.isAdvanced &&
          <OrderBook
            className={styles.orderBook}
            baseCurrency={baseCurrency}
            quoteCurrency={quoteCurrency}
            baseSmartAddress={baseSmartAddress}
            quoteSmartAddress={quoteSmartAddress}
            onPickPrice={price => this.props.formActions.updateField('resDexBuySell', 'price', price.toString())}
            orderBook={this.props.buySell.orderBook.baseQuote}
          />
        }

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
  actions: bindActionCreators(ResDexBuySellActions, dispatch),
  formActions: bindActionCreators(RoundedFormActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ResDexBuySell))
