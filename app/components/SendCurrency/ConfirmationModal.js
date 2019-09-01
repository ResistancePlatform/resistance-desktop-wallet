// @flow
import React, { Component } from 'react'
import { Decimal } from 'decimal.js'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { toDecimalPlaces } from '~/utils/decimal'
import {
  RoundedButton,
} from '~/components/rounded-form'
import { SendCurrencyActions, SendCurrencyState } from '~/reducers/send-currency/send-currency.reducer'

import styles from './ConfirmationModal.scss'

type Props = {
  t: any,
  actions: object,
  form: any,
	sendCurrency: SendCurrencyState
}

/**
 * @class ConfirmaitonModal
 * @extends {Component<Props>}
 */
class ConfirmaitonModal extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props

    const {
      fromAddress,
      toAddress,
      amount
    } = (this.props.form && this.props.form.fields || {})

    const {
      isSubmitting,
      arePrivateTransactionsEnabled
    } = this.props.sendCurrency

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.confirmation)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeConfirmationModal}
            onKeyDown={() => {}}
          />

        {/* Title */}
        <div className={styles.title}>
          {t(`Please confirm your transaction`)}
        </div>

        <ul className={styles.list}>
          <li>
            <span>{t(`From`)}</span>
            {fromAddress}
          </li>
          <li>
            <span>{t(`To`)}</span>
            {toAddress}
          </li>
          <li>
            <span>{t(`Amount`)}</span>
            {toDecimalPlaces(Decimal(amount), 8)} RES
          </li>
          <li className={styles.privateTransaction}>
            <span>{t(`Private transaction`)}</span>

            <div className={cn('icon', styles.check, {[styles.enabled]: arePrivateTransactionsEnabled})} />

            <div className={styles.yesNo}>
              {t(`Yes`)}
            </div>

            <div className={cn('icon', styles.check, {[styles.enabled]: !arePrivateTransactionsEnabled})} />

            <div className={styles.yesNo}>
              {t(`No`)}
            </div>

          </li>
        </ul>


        <div className={styles.buttons}>
          <RoundedButton
            type="submit"
            onClick={this.props.actions.sendCurrency}
            important
            disabled={isSubmitting}
          >
            {t(`Send`)}
          </RoundedButton>

          <RoundedButton onClick={this.props.actions.closeConfirmationModal}>
            {t(`Cancel`)}
          </RoundedButton>
        </div>
    </div>
    </div>
    )
  }
}

const mapStateToProps = state => ({
  sendCurrency: state.sendCurrency,
  form: state.roundedForm.sendCurrency
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(SendCurrencyActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('send-currency')(ConfirmaitonModal))
