// @flow
import { Decimal } from 'decimal.js'
import * as Joi from 'joi'
import React from 'react'
import { bindActionCreators } from 'redux'
import cn from 'classnames'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'

import { toMaxDigits } from '~/utils/decimal'
import {
  Info,
  RoundedForm,
  RoundedButton,
  CheckBox,
  CurrencyAmountInput,
  PriceInput,
  BorderlessButton,
} from '~/components/rounded-form'
import { RoundedFormActions } from '~/reducers/rounded-form/rounded-form.reducer'
import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'
import BuySellFormMixin from '../BuySellFormMixin'

import styles from './LimitOrderForm.scss'


function getValidationSchema(t) {
  return Joi.object().keys({
    price: Joi.string().required().label(t(`Price`)),
    amount: Joi.string().required().label(t(`Max. amount`)),
    total: Joi.string().optional()
  })
}

type Props = {
  t: any,
  resDex: ResDexState,
  actions: object,
  form: any,
  formActions: object
}

/**
 * @class LimitOrderForm
 * @extends {Component<Props>}
 */
class LimitOrderForm extends BuySellFormMixin {
	props: Props

	/**
	 * @memberof LimitOrderForm
	 */
  constructor(props) {
    super(props)

    this.state = {
      isMaker: false
    }
  }

  updateValue(field, calculator) {
    const { updateField } = this.props.formActions

    let value

    try {
      value = calculator()
    } catch(err) {
      return
    }

    updateField('resDexLimitOrder', field, toMaxDigits(value))
  }

  updateAmount(total) {
    if (!this.props.form || !this.props.form.fields) {
      return
    }
    const { price } = this.props.form.fields
    this.updateValue('amount', () => Decimal(total).dividedBy(price))
  }

  updateTotalWithAmount(amount) {
    if (!this.props.form || !this.props.form.fields) {
      return
    }
    const { price } = this.props.form.fields
    this.updateValue('total', () => Decimal(amount).times(Decimal(price)))
  }

  updateTotalWithPrice(price) {
    if (!this.props.form || !this.props.form.fields) {
      return
    }
    const { amount } = this.props.form.fields
    this.updateValue('total', () => Decimal(amount).times(Decimal(price)))
  }

  render() {
    const { t } = this.props
    const { baseCurrency, quoteCurrency } = this.props.resDex.buySell

    const buttonAttributes = {
      disabled: this.getSubmitButtonDisabledAttribute(),
      spinner: this.props.resDex.buySell.isSendingOrder,
      spinnerTooltip: t(`Sending the order...`),
    }

    const { isMaker } = this.state

    const { updateField } = this.props.formActions

    const maxBaseAmount = this.getMaxAmount(baseCurrency)
    const maxQuoteAmount = this.getMaxAmount(quoteCurrency)

    const isInstantSwapAllowed = this.getIsInstantSwapAllowed()

    return (
      <div className={styles.limitOrder}>
        <div className={styles.title}>
          <div className={styles.caption}>
            {t(`Limit Order`)}
          </div>

          <CheckBox
            name="makerOnly"
            className={styles.makerOnlyCheckbox}
            onChange={value => this.setState({ isMaker: value })}
            defaultValue={false}
          >
            {t(`Maker Only`)}
            <Info tooltip={t(`This will place an open order in the orderbook without first attempting to fill an existing order`)} />
          </CheckBox>

        </div>

        <RoundedForm
          id="resDexLimitOrder"
          className={cn(styles.form)}
          schema={getValidationSchema(t)}
          overrideOnMount
        >
          <PriceInput
            name="price"
            label={t(`Price`)}
            labelClassName={styles.inputLabel}
            bestPrice={this.getBestPrice()}
            baseCurrency={baseCurrency}
            quoteCurrency={quoteCurrency}
            onChange={price => this.updateTotalWithPrice(price)}
          />

          <div className={styles.amountRate}>
            <div className={styles.caption}>
              {t(`Amount`)}
            </div>

            <div className={styles.rates}>
              <BorderlessButton
                onClick={() => updateField('resDexLimitOrder', 'amount', toMaxDigits(maxBaseAmount.times(Decimal('0.25'))))}
              >25%
              </BorderlessButton>

              <BorderlessButton
                onClick={() => updateField('resDexLimitOrder', 'amount', toMaxDigits(maxBaseAmount.times(Decimal('0.5'))))}
              >50%
              </BorderlessButton>

              <BorderlessButton
                onClick={() => updateField('resDexLimitOrder', 'amount', toMaxDigits(maxBaseAmount.times(Decimal('0.75'))))}
              >75%
              </BorderlessButton>

            </div>

          </div>

          <CurrencyAmountInput
            name="amount"
            addonClassName={styles.maxBaseAddon}
            buttonLabel={t(`Use max`)}
            maxAmount={maxBaseAmount}
            symbol={baseCurrency}
            onChange={amount => this.updateTotalWithAmount(amount)}
          />

          <CurrencyAmountInput
            name="total"
            addonClassName={styles.maxQuoteAddon}
            buttonLabel={t(`Use max`)}
            maxAmount={maxQuoteAmount}
            labelClassName={styles.inputLabel}
            label={t(`Total`)}
            symbol={quoteCurrency}
            onChange={total => this.updateAmount(total)}
          />

          <div className={styles.bottomControls}>
            <RoundedButton
              type="submit"
              className={cn(styles.exchangeButton, styles.buy)}
              onClick={() => this.props.actions.createAdvancedOrder({
                isBuy: true,
                isMaker,
              })}
              {...buttonAttributes}
              important
              small
            >
              {t(`Buy {{baseCurrency}}`, { baseCurrency })}
            </RoundedButton>

            <RoundedButton
              type="submit"
              className={cn(styles.exchangeButton, styles.sell)}
              onClick={() => this.props.actions.createAdvancedOrder({
                isBuy: false,
                isMaker,
              })}
              {...buttonAttributes}
              important
              small
            >
              {t(`Sell {{baseCurrency}}`, { baseCurrency })}
            </RoundedButton>

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

        </RoundedForm>

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
	resDex: state.resDex,
	buySell: state.resDex.buySell,
	orders: state.resDex.orders,
	accounts: state.resDex.accounts,
  form: state.roundedForm.resDexLimitOrder
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexBuySellActions, dispatch),
  formActions: bindActionCreators(RoundedFormActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(LimitOrderForm))
