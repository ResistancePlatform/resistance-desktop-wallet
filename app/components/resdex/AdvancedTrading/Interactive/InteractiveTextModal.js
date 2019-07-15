// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import QRCode from 'qrcode.react'

import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import {
  RoundedInput,
  RoundedButton
} from '~/components/rounded-form/index'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'

import styles from './InteractiveTextModal.scss'

type Props = {
  t: any,
  accounts: ResDexState.accounts,
  actions: object
}

/**
 * @class InteractiveTextModal
 * @extends {Component<Props>}
 */
class InteractiveTextModal extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props

    const { symbol } = this.props.accounts.depositModal
    const { address } = this.props.accounts.currencies.RESDEX[symbol]

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.deposit)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeInteractiveTextModal}
            onKeyDown={() => {}}
          />

        {/* Title */}
        <div className={styles.title}>
          {t(`Deposit {{symbol}}`, { symbol })}
        </div>

        {address &&
          <QRCode className={styles.qr} value={address} />
        }

        <RoundedInputWithCopy
          labelClassName={styles.addressInputLabel}
          defaultValue={address}
          label="Address"
          readOnly
        />

    </div>
    </div>
    )
  }
}

const mapStateToProps = state => ({
	accounts: state.resDex.accounts
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexAccountsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(InteractiveTextModal))

