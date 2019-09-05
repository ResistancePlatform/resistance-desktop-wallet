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

  getBaseResEquivalent() {
    const { quoteCurrency } = this.props.buySell
    const { orderBook } = this.props.buySell

    if (!this.props.form) {
      return null
    }

    const { maxRel } = this.props.form.fields

    if (!maxRel) {
      return null
    }

    if (quoteCurrency === 'RES') {
      return Decimal(maxRel)
    }

    if (!orderBook.resQuote.asks.length) {
      return null
    }

    const resAmount = Decimal(maxRel).dividedBy(orderBook.resQuote.asks[0].price)

    return resAmount
  }

  getZCreditsBaseEquivalentCaption() {
    const { baseCurrency } = this.props.buySell
    const { orderBook } = this.props.buySell

    const baseRes = this.getBaseResEquivalent()

    if (baseRes === null) {
      return null
    }

    const { zCredits } = this.props.accounts

    if (zCredits === null) {
      return null
    }

    let priceInRes = Decimal(1)

    if (baseCurrency !== 'RES') {
      if (!orderBook.baseRes.bids.length) {
        return null
      }

      const baseAmount = baseRes.dividedBy(orderBook.baseRes.bids[0].price)

      priceInRes = baseRes.dividedBy(baseAmount)
    }

    const amount = zCredits.dividedBy(priceInRes)

    return `${toDecimalPlaces(amount)} ${baseCurrency}`
  }

  getIsInstantSwapAllowed(): boolean {
    const { zCredits } = this.props.accounts
    const resBase = this.getBaseResEquivalent()

    if (zCredits == null || resBase  === null || resBase.isZero()) {
      return false
    }

    const dynamicTrust = zCredits.minus(resBase.times(Decimal('1.05')))
    return dynamicTrust.greaterThanOrEqualTo(Decimal(0))
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
      !['completed', 'failed', 'cancelled'].includes(swap.privacy.status)
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
    log.debug('baseCurrency, quoteCurrency', baseCurrency, quoteCurrency)

    const orderAttrs = this.getOrderAttributes()
    const isInstantSwapAllowed = this.getIsInstantSwapAllowed()

    return (
      <RoundedForm
        id="resDexBuySell"
        className={cn(styles.form, this.props.className)}
        schema={getValidationSchema(t, isAdvanced)}
        overrideOnMount
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
                  <Info tooltip={t(`The maximum amount of {{symbol}} you are willing to trade — the actual trade amount can be less.`, {symbol: quoteCurrency})} />
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
                  <Info tooltip={t(`The minimum price in RES you will accept for 1 {{symbol}}`, {symbol: quoteCurrency})} />
                </div>

                <PriceInput
                  name="price"
                  bestPrice={this.getBestPrice()}
                  baseCurrency={baseCurrency}
                  quoteCurrency={quoteCurrency}
                  disabled={orderAttrs.isMarket || orderAttrs.isPrivate}
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
                {this.getZCreditsBaseEquivalentCaption() || t(`N/A`)}
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
