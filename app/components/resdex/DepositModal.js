// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import QRCode from 'qrcode.react'

import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import RoundedInputWithCopy from '~/components/rounded-form/RoundedInputWithCopy'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'

import styles from './DepositModal.scss'

type Props = {
  t: any,
  resdex2?: boolean,
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

    const { symbol } = this.props.accounts.depositModal
    const { currencies } = this.props.accounts


    const { address } = this.props.resdex2
      ? currencies.RESDEX_PRIVACY2[symbol]
      : currencies.RESDEX[symbol]

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.deposit, {[styles.resdex2]: this.props.resdex2})}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={
              this.props.resdex2
              ? this.props.actions.closeResdex2DepositModal
              : this.props.actions.closeDepositModal
            }
            onKeyDown={() => {}}
          />

        {/* Title */}
        <div className={styles.title}>
          {this.props.resdex2
            ? t(`Deposit ETH to private balance`)
            : t(`Deposit {{symbol}}`, { symbol })
          }
        </div>

        {this.props.resdex2 &&
          <div className={styles.caution}>
            <strong>{t(`Caution`)}:</strong>
            {t(`You must have 0.001 ETH deposited in both normal ETH wallet and 0.001 deposited in private balance in order to do private swap otherwise the swap won’t work.`)}
          </div>
        }

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

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(DepositModal))
