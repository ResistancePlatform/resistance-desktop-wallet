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

import styles from './DepositModal.scss'

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

    return (
      <div className={styles.container}>
				<div
          role="button"
          tabIndex={0}
					className={cn('icon', styles.closeButton)}
					onClick={this.props.actions.close}
					onKeyDown={() => {}}
				/>

				{/* Title */}
        <div className={styles.title}>
          {t(`Deposit`)}
        </div>

        <QRCode className={styles.qr} value={this.props.accounts.depositModal.address} />

        <RoundedInput
          name="address"
          defaultValue={this.props.accounts.depositModal.address}
          label="Address"
          newAddon={new CopyAddon()}
          readOnly
        />

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
