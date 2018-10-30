// @flow
import * as Joi from 'joi'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'
import RoundedInput from '~/components/rounded-form/RoundedInput'
import ChooseWallet from '~/components/rounded-form/ChooseWallet'
import RoundedTextArea from '~/components/rounded-form/RoundedTextArea'
import RoundedForm from '~/components/rounded-form/RoundedForm'

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

        <RoundedInput
          name="recipientAddress"
          label={t(`Recipient wallet`)}
          addon={{ enable: true, type: 'PASTE' }}
        />

        <ChooseWallet
          name="withdrawFrom"
          label={t(`Withdraw from`)}
          defaultValue={this.props.accounts.withdrawModal.symbol}
          currencies={this.props.accounts.currencies}
        />

        <div className={styles.inputsRow}>
          <div>
            <div className={styles.caption}>{t(`Amount`)}</div>
            <RoundedInput className={styles.amount} name="amount" number />
          </div>
          <div>
            <div className={styles.caption} />
            <RoundedInput name="equity" readOnly number />
          </div>
        </div>

        <div className={styles.caption}>
          {t(`Note`)}
        </div>

        <RoundedTextArea name="note" rows={4} >
          {t(`Write an optional message`)}
        </RoundedTextArea>

        <button type="submit" onClick={this.props.actions.withdraw}>{t(`Withdraw`)}</button>
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
