// @flow
import React, { Component } from 'react'
import * as Joi from 'joi'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { getEquity } from '~/utils/resdex'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import {
  RoundedForm,
  RoundedInput,
  RoundedButton,
  CurrencyAmountInput,
} from '~/components/rounded-form'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'

import styles from './InstantDexDepositModal.scss'

const getValidationSchema = t => Joi.object().keys({
  weeks: Joi.number().min(1).max(52).required().label(t(`Weeks`)),
  amount: Joi.number().min(10.0001).required().label(t(`Amount`)),
  equity: Joi.number().optional(),
})

type Props = {
  t: any,
  assets: ResDexState.assets,
  accounts: ResDexState.accounts,
  form: object,
  actions: object
}

/**
 * @class InstantDexDepositModal
 * @extends {Component<Props>}
 */
class InstantDexDepositModal extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props

    const { symbol } = this.props.accounts.depositModal
    const { isInProgress } = this.props.accounts.instantDexDepositModal

    const { currencies } = this.props.accounts
    const resCurrency = currencies.RESDEX[symbol]

    const { amount } = this.props.form && this.props.form.fields || {}
    const { currencyHistory } = this.props.assets

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.instantDexDeposit)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeInstantDexDepositModal}
            onKeyDown={() => {}}
          />

        {/* Title */}
        <div className={styles.title}>
          {t(`Instant DEX Deposit`)}
        </div>

        <RoundedForm
          id="resDexAccountsInstantDexDepositModal"
          schema={getValidationSchema(t)}
        >
          <RoundedInput
            name="weeks"
            type="number"
            label={t(`Weeks`)}
            defaultValue={1}
            step={1}
          />

          <div className={styles.inputsRow}>
            <div>
              <div className={styles.caption}>{t(`Amount`)}</div>

              <CurrencyAmountInput
                className={styles.amount}
                defaultValue={10.0001}
                min="10.0001"
                step="1"
                name="amount"
                symbol={symbol}
                maxAmount={resCurrency && resCurrency.balance}
              />

            </div>

            <div className={cn('icon', styles.exchangeIcon)} />

            <div>
              <div className={styles.caption} />

              <CurrencyAmountInput
                name="equity"
                symbol="USD"
                defaultValue={getEquity('RES', amount, currencyHistory) || '0'}
                readOnly
              />
            </div>

          </div>

          <RoundedButton
            type="submit"
            className={styles.rightButton}
            onClick={this.props.actions.instantDexDeposit}
            spinner={isInProgress}
            disabled={isInProgress}
            important
          >
            {t(`Deposit`)}
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
  form: state.roundedForm.resDexAccountsInstantDexDepositModal,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexAccountsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(InstantDexDepositModal))
