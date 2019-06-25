// @flow
import { Decimal } from 'decimal.js'
import * as Joi from 'joi'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import cn from 'classnames'
import { translate } from 'react-i18next'
import log from 'electron-log'

import { toDecimalPlaces } from '~/utils/decimal'
import {
  Info,
  RoundedForm,
  RoundedButton,
  CheckBox,
  RadioButton,
  CurrencyAmountInput,
  PriceInput,
  ChooseWalletInput
} from '~/components/rounded-form'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'

import styles from './BuySellForm.scss'

type Props = {
  t: any,
  className?: string,
  isAdvanced?: boolean,
  form: object,
  buySell: ResDexState.buySell,
  orders: ResDexState.orders,
  accounts: ResDexState.accounts,
  actions: object
}

function getValidationSchema(t, isAdvanced) {
  return Joi.object().keys({
    isMarketOrder: Joi.boolean().default(!isAdvanced),
    sendFrom: Joi.string().required().label(t(`Send from`)),
    receiveTo: Joi.string().required().label(t(`Receive to`)),
    maxRel: Joi.string().required().label(t(`Max. amount`)),
    price: Joi.string().when('isMarketOrder', {
      is: false, then: Joi.string().required().label(t(`Price`))
    }),
    enhancedPrivacy: Joi.boolean().default(false).label(t(`Enhanced privacy`)),
  })
}

/**
 * @class BuySellForm
 * @extends {Component<Props>}
 */
class BuySellForm extends Component<Props> {
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

  getZCreditsQuoteEquivalent() {
    const { zCredits } = this.props.accounts

    if (zCredits === null) {
      return null
    }

    const { RESDEX: currencies } = this.props.accounts.currencies
    const { quoteCurrency } = this.props.buySell

    if (!(quoteCurrency in currencies)) {
      return null
    }

    const { price } = currencies[quoteCurrency]

    if (price.isZero()) {
      return { amount: zCredits, symbol: 'RES' }
    }

    const amount = zCredits.dividedBy(price)
    return { amount, symbol: quoteCurrency }
  }

  getZCreditsQuoteEquivalentCaption() {
    const equivalent = this.getZCreditsQuoteEquivalent()

    if (equivalent === null) {
      return null
    }

    const { amount, symbol } = equivalent
    return `${toDecimalPlaces(amount)} ${symbol}`
  }

  getIsInstanceSwapAllowed() {
    const { zCredits } = this.props.accounts
    const equivalent = this.getZCreditsQuoteEquivalent()

    if (zCredits == null || equivalent === null || !this.props.form) {
      return false
    }

    const { maxRel } = this.props.form.fields

    if (!maxRel) {
      return false
    }

    // Show instant swaps as allowed if the order book is empty and zCredits balance is present
    if (equivalent.symbol === 'RES') {
      return zCredits.greaterThan(Decimal(0))
    }

    return zCredits.greaterThanOrEqualTo(Decimal(maxRel))
  }

  getOrderAttributes() {
    const { form, isAdvanced } = this.props
    const isMarket = form && form.fields.isMarketOrder || !isAdvanced
    const isPrivate = Boolean(form && form.fields.enhancedPrivacy && isMarket)
    return {
      isMarket,
      isPrivate
    }
  }

  // Can't create a market order if there's no liquidity or when sending an order
  getSubmitButtonDisabledAttribute() {
    const { swapHistory } = this.props.orders
    const { baseCurrency, quoteCurrency, orderBook, isSendingOrder } = this.props.buySell

    const orderAttrs = this.getOrderAttributes()

    if (!orderAttrs.isMarket) {
      return isSendingOrder
    }

    const arePendingPrivateOrdersPresent = swapHistory.filter(
      swap => swap.isPrivate &&
      !['completed', 'failed'].includes(swap.privacy.status)
    ).length

    const areAllAsksPresent = orderAttrs.isPrivate
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

  render() {
    const { t, isAdvanced } = this.props
    const { baseCurrency, quoteCurrency } = this.props.buySell
    const txFee = this.props.accounts.currencyFees[quoteCurrency]
    log.info(" baseCurrency, quoteCurrency ", baseCurrency, quoteCurrency)

    const orderAttrs = this.getOrderAttributes()
    const isInstantSwapAllowed = this.getIsInstanceSwapAllowed()

    return (
      <RoundedForm
        id="resDexBuySell"
        className={cn(styles.form, this.props.className)}
        schema={getValidationSchema(t, isAdvanced)}
        clearOnUnmount
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
        <ChooseWalletInput
          name="sendFrom"
          labelClassName={styles.oldInputLabel}
          defaultValue={quoteCurrency}
          label={t(`Send from`)}
          onChange={this.props.actions.updateQuoteCurrency}
          currencies={this.props.accounts.currencies.RESDEX}
        />

        <ChooseWalletInput
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
                  disabled={orderAttrs.isMarket && orderAttrs.isPrivate}
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

        {orderAttrs.isMarket &&
        <div className={styles.bottomControls}>

          <CheckBox name="enhancedPrivacy" className={styles.enhancedPrivacyCheckbox} defaultValue={false}>
            {t(`Enhanced privacy`)}

            <Info
              tooltipClassName={styles.enhancedPrivacyTooltip}
              tooltip={t('enhanced-privacy')}
            />

          </CheckBox>

          <div className={cn(styles.instantSwap, {[styles.allowed]: isInstantSwapAllowed})}>
            {isInstantSwapAllowed
              ? t(`Instant swap allowed`)
              : t(`Instant swap disallowed`)
            }

            <Info tooltipClassName={styles.tooltip}>
              <div className={styles.title}>
                {t(`Instant swap`)}
              </div>

              <div className={styles.body}>
                {this.getZCreditsQuoteEquivalentCaption() || t(`N/A`)}
              </div>
            </Info>
          </div>

        </div>
        }

        <RoundedButton
          type="submit"
          className={styles.exchangeButton}
          onClick={
            orderAttrs.isPrivate
            ? this.props.actions.createPrivateOrder
            : this.props.actions.createOrder
          }
          disabled={txFee && this.getSubmitButtonDisabledAttribute()}
          spinner={this.props.buySell.isSendingOrder}
          spinnerTooltip={t(`Sending the order...`)}
          important
          large={!isAdvanced}
        >
          {orderAttrs.isMarket ? t(`Exchange`) : t(`Add to order book`)}
        </RoundedButton>
      </RoundedForm>
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
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(BuySellForm))
