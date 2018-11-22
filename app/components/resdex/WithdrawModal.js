// @flow
import { Decimal } from 'decimal.js'
import * as Joi from 'joi'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'
import {
  RoundedForm,
  RoundedButton,
  RoundedInputWithPaste,
  CurrencyAmountInput,
  RoundedTextArea,
  ChooseWallet,
} from '~/components/rounded-form'

import styles from './WithdrawModal.scss'

const getValidationSchema = t => Joi.object().keys({
  recipientAddress: Joi.string().required().label(t(`Recipient address`)),
  withdrawFrom: Joi.string().required(),
  amount: Joi.number().min(0).required().label(t(`Amount`)),
  equity: Joi.number(),
  note: Joi.string().optional().label(t(`Note`)),
})

type Props = {
  t: any,
  assets: ResDexState.assets,
  accounts: ResDexState.accounts,
  form: object,
  actions: object
}

/**
 * @class WithdrawModal
 * @extends {Component<Props>}
 */
class WithdrawModal extends Component<Props> {
	props: Props

  getEquity(symbol) {
    if (!this.props.form) {
      return null
    }

    const { amount } = this.props.form.fields

    const { currencyHistory } = this.props.assets
    const hourHistory = currencyHistory.hour && currencyHistory.hour[symbol]

    const price = hourHistory && hourHistory.slice(-1)[0].value

    return amount && price && Decimal(amount).mul(price).toDP(2, Decimal.ROUND_FLOOR)
  }

	render() {
    const { t } = this.props
    const { symbol } = this.props.accounts.withdrawModal
    const currency = this.props.accounts.currencies.RESDEX[symbol]

    const { isInProgress } = this.props.accounts.withdrawModal

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.withdraw)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeWithdrawModal}
            onKeyDown={() => false}
          />

          {/* Title */}
          <div className={styles.title}>
            {t(`Withdraw`)} {symbol}
          </div>

          <RoundedForm
            id="resDexAccountsWithdrawModal"
            schema={getValidationSchema(t)}
          >

          <RoundedInputWithPaste
            name="recipientAddress"
            label={t(`Recipient wallet`)}
          />

          <ChooseWallet
            name="withdrawFrom"
            label={t(`Withdraw from`)}
            defaultValue={symbol}
            currencies={this.props.accounts.currencies.RESDEX}
            onChange={this.props.actions.updateWithdrawalSymbol}
          />

          <div className={styles.inputsRow}>
            <div>
              <div className={styles.caption}>{t(`Amount`)}</div>

              <CurrencyAmountInput
                className={styles.amount}
                defaultValue={0}
                name="amount"
                symbol={symbol}
                maxAmount={currency && currency.balance}
              />
            </div>

            <div className={cn('icon', styles.exchangeIcon)} />

            <div>
              <div className={styles.caption} />

              <CurrencyAmountInput
                name="equity"
                symbol="USD"
                defaultValue={this.getEquity(symbol)}
                readOnly
              />
            </div>

          </div>

          <div className={styles.caption}>
            {t(`Note`)}
          </div>

          <RoundedTextArea
            name="note"
            rows={4}
            placeholder={t(`Write an optional message`)}
          />

          <RoundedButton
            type="submit"
            className={styles.button}
            onClick={this.props.actions.withdraw}
            spinner={isInProgress}
            disabled={isInProgress}
            important
          >
            {t(`Withdraw`)}
          </RoundedButton>

        </RoundedForm>
      </div>
    </div>
    )
  }
}

const mapStateToProps = state => ({
	assets: state.resDex.assets,
	accounts: state.resDex.accounts,
  form: state.roundedForm.resDexAccountsWithdrawModal,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexAccountsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(WithdrawModal))
