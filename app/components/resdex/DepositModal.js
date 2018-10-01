// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import QRCode from 'qrcode.react'

import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import RoundedInput, { CopyAddon } from '~/components/rounded-form/RoundedInput'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'

import styles from './Modal.scss'

type Props = {
  t: any,
  accounts: ResDexState.accounts,
  actions: object
}

/**
 * @class DepositModal
 * @extends {Component<Props>}
 */
class DepositModal extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props

    const { address } = this.props.accounts.currencies.find(currency => (
      currency.symbol === this.props.accounts.depositModal.symbol
    ))

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.deposit)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeDepositModal}
            onKeyDown={() => {}}
          />

        {/* Title */}
        <div className={styles.title}>
          {t(`Deposit`)}
        </div>

        {address &&
          <QRCode className={styles.qr} value={address} />
        }

        <RoundedInput
          name="address"
          labelClassName={styles.addressInputLabel}
          defaultValue={address}
          label="Address"
          newAddon={new CopyAddon()}
          readOnly
        />

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

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(DepositModal))
