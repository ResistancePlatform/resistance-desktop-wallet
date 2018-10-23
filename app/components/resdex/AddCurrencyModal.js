// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import RoundedInput from '~/components/rounded-form/NewRoundedInput'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'

import styles from './Modal.scss'

type Props = {
  t: any,
  accounts: ResDexState.accounts,
  actions: object
}

/**
 * @class AddCurrencyModal
 * @extends {Component<Props>}
 */
class AddCurrencyModal extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props

    const { isInEditMode, symbol } = this.props.accounts.addCurrencyModal
    // const { address } = this.props.accounts.currencies[symbol]

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.deposit)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeAddCurrencyModal}
            onKeyDown={() => {}}
          />

        <div className={styles.title}>
          {isInEditMode ? t(`Edit coin`) : t(`Add new coin`)}
        </div>

        <RoundedInput
          defaultValue=""
          label={t(`RPC port`)}
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

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(AddCurrencyModal))
