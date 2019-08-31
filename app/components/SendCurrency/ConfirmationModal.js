// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import QRCode from 'qrcode.react'

import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import {
  RoundedButton,
} from '~/components/rounded-form'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'

import styles from './ConfirmaitonModal.scss'

type Props = {
  t: any,
  accounts: ResDexState.accounts,
  actions: object
}

/**
 * @class ConfirmaitonModal
 * @extends {Component<Props>}
 */
class ConfirmaitonModal extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.confirmation)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeConfirmaitonModal}
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
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(SendCurrencyActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ConfirmaitonModal))
