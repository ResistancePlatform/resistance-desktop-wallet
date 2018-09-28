// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'
import RoundedInput, { ChooseWalletAddon, CopyAddon } from '~/components/rounded-form/RoundedInput'
import RoundedForm from '~/components/rounded-form/RoundedForm'

import styles from './Modal.scss'

const getValidationSchema(t) = Joi.object().keys({
  name: Joi.string().required().label(`Name`),
  address: (
    validateAddress.getJoi()
    .resistanceAddress()
    .rZ().rLength().zLength().valid()
    .required().label(`Address`)
  )
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
        <div className={styles.container}>
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
          label={t(`Resipient wallet`)}
        />

        <RoundedInput
          name="withdrawFrom"
          labelClassName={styles.inputLabel}
          label={t(`Withdraw from`)}
          newAddon={new ChooseWalletAddon([])}
          number
        />

        <div className={styles.inputsRow}>
          <div>
            <div className={styles.caption}>{t(`Amount`)}<i /></div>
            <RoundedInput className={styles.amount} name="amount" number />
          </div>
          <div>
            <RoundedInput name="equity" readOnly number />
          </div>
        </div>

        <button type="submit">{t(`Withdraw`)}</button>
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
