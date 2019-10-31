// @flow
import { Decimal } from 'decimal.js'
import * as Joi from 'joi'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import cn from 'classnames'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'

import {
  Info,
  RoundedForm,
  RoundedButton,
  CheckBox,
  CurrencyAmountInput,
  PriceInput,
} from '~/components/rounded-form'
import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'

import styles from './LimitOrderForm.scss'


function getValidationSchema(t) {
  return Joi.object().keys({
    amount: Joi.string().required().label(t(`Max. amount`)),
    price: Joi.string().required().label(t(`Price`))
  })
}

type Props = {
  t: any,
  resDex: ResDexState,
  actions: object
}

/**
 * @class LimitOrderForm
 * @extends {Component<Props>}
 */
class LimitOrderForm extends Component<Props> {
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

  getBestPrice(): object | null {
    const { orderBook } = this.props.resDex.buySell
    const { asks  } = orderBook.baseQuote
    return asks.length ? asks[0].price : null
  }

  getSubmitButtonDisabledAttribute() {
    return false
  }

  getMaxQuoteAmount() {
    return Decimal(0)
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
          clearOnUnmount
        >
          <PriceInput
            name="price"
            bestPrice={this.getBestPrice()}
            baseCurrency={quoteCurrency}
            quoteCurrency={baseCurrency}
          />

          <CurrencyAmountInput
            name="amount"
            buttonLabel={t(`Use max`)}
            addonClassName={styles.maxRelAddon}
            min="0.001"
            maxAmount={this.getMaxQuoteAmount()}
            symbol={quoteCurrency}
          />

        </RoundedForm>


        <div className={styles.buttons}>
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
            {t(`Buy {{quoteCurrency}}`, { quoteCurrency })}
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
            {t(`Sell {{quoteCurrency}}`, { quoteCurrency })}
          </RoundedButton>

        </div>

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
	resDex: state.resDex,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexBuySellActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(LimitOrderForm))
