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
  RoundedInput,
  RoundedInputWithPaste,
  RoundedInputWithMaxAmount,
  RoundedTextArea,
  ChooseWallet,
} from '~/components/rounded-form'

import styles from './WithdrawModal.scss'

const getValidationSchema = t => Joi.object().keys({
  recipientAddress: Joi.string().required().label(t(`Recipient address`)),
  withdrawFrom: Joi.string().required(),
  amount: Joi.number().required().label(t(`Amount`)),
  equity: Joi.number(),
  note: Joi.string().optional().label(t(`Note`)),
})

type Props = {
  t: any,
  accounts: ResDexState.accounts,
  actions: object
}

/**
 * @class WithdrawModal
 * @extends {Component<Props>}
 */
class WithdrawModal extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props
    const { symbol } = this.props.accounts.withdrawModal

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.withdraw)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeWithdrawModal}
            onKeyDown={() => {}}
          />

        {/* Title */}
        <div className={styles.title}>
          {t(`Withdraw`)}
        </div>

        <RoundedForm
          id="addressBookNewAddressDialog"
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
          currencies={this.props.accounts.currencies}
        />

        <div className={styles.inputsRow}>
          <div>
            <div className={styles.caption}>{t(`Amount`)}</div>
            <RoundedInputWithMaxAmount
              className={styles.amount} name="amount"
              symbol={symbol}
              maxAmount={Decimal(100)}
            />
          </div>
          <div>
            <div className={styles.caption} />
            <RoundedInput type="number" name="equity" readOnly />
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

const mapStateToProps = (state) => ({
	accounts: state.resDex.accounts
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexAccountsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(WithdrawModal))
