// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { getStore } from '~/store/configureStore'
import { RoundedButton } from '~/components/rounded-form'
import { OwnAddressesActions } from '~/reducers/own-addresses/own-addresses.reducer'

import styles from './ConnectLedgerModal.scss'


type Props = {
  t: any,
  actions: object,
  connectLedgerModal: object,
}

/**
 * @class ConnectLedgerModal
 * @extends {Component<Props>}
 */
class ConnectLedgerModal extends Component<Props> {
	props: Props

  componentWillMount(){
    getStore().dispatch(this.props.actions.getLedgerConnected())
  }

  getConnectLedgerContent() {
    const { t } = this.props

    return (
      <div>
        <div className={styles.title}>
          {t(`Connect Ledger`)}
        </div>

        <ul className={styles.stepsList}>
          <li>
            <div className={cn('icon', styles.icon, styles.connectIcon)} />
            <div className={styles.description}>
              {t(`Connect and unlock your Ledger device`)}
            </div>
            <div className={cn('icon', styles.mark, {[styles.active]: this.props.connectLedgerModal.isLedgerConnected})} />
          </li>
          <li>
            <div className={cn('icon', styles.icon, styles.navigateIcon)} />
            <div className={styles.description}>
              {t(`Navigate to the Resistance app on your device`)}
            </div>
            <div className={cn('icon', styles.mark, {[styles.active]: this.props.connectLedgerModal.isLedgerResistanceAppOpen})} />
          </li>
        </ul>

        <RoundedButton
          className={styles.continueButton}
          onClick={this.props.actions.getLedgerConnected}
          important
        >
          {t(`Connect`)}
        </RoundedButton>
        
        {t(` `)}

        <RoundedButton
          className={cn(styles.continueButton, {[styles.active]: this.props.connectLedgerModal.isLedgerConnected && this.props.connectLedgerModal.isLedgerResistanceAppOpen )}
          onClick={this.props.actions.createTransaction}
          important
        >
          {t(`Continue`)}
        </RoundedButton>

      </div>
    )
  }

  getConfirmTransactionContent() {
    const { t } = this.props

    return (
      <div className={styles.title}>
        {t(`Please confirm transaction on Ledger`)}
      </div>
    )
  }

  connectionSuccessful() {
    const { t } = this.props

    return (
      <div>
        <div className={styles.header}>
          {t(`Ledger Successfully Connected`)}
        </div>
        <div className={styles.note}>
          {t(`Your Ledger is now connected. Please note that if your Ledger is disconnected, or it times out you will need to reconnect it here.`)}
        </div>
      </div>
    )
  }

  getTransactionSentContent() {
    const { t } = this.props

    return (
      <div className={styles.transactionSent}>
        <div className={styles.checkMark} />

        <div className={styles.header}>
          {t(`Transaction sent`)}
        </div>

        <div className={styles.note}>
          {t(`Your account balance will update once the blockchain has confirmed the transaction`)}
        </div>

        <RoundedButton
          className={styles.viewDetailsButton}
          onClick={this.props.actions.closeConnectLedgerModal}
          important
        >
          {t(`View details`)}
        </RoundedButton>

      </div>
    )
  }

	render() {
    const {
      isLedgerConnected,
      isTransactionConfirmed,
      isTransactionSent,
      isLedgerResistanceAppOpen
    } = this.props.connectLedgerModal

		return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.connectLedger)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeConnectLedgerModal}
            onKeyDown={() => {}}
          />

          { this.getConnectLedgerContent() }

          { /*(isLedgerConnected && isLedgerResistanceAppOpen) && this.connectionSuccessful() */}

          {/* isTransactionSent && this.getTransactionSentContent() } */}

        </div>
      </div>
		)
	}
}

const mapStateToProps = (state) => ({
	connectLedgerModal: state.ownAddresses.connectLedgerModal
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(OwnAddressesActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('own-addresses')(ConnectLedgerModal))
