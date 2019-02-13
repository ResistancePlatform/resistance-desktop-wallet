// @flow
import { Decimal } from 'decimal.js'
import React, { Component} from 'react'
import log from 'electron-log'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import { shell } from 'electron';

import { RoundedButton } from '~/components/rounded-form'
import RoundedInput from '~/components/rounded-form/RoundedInput'
import { OwnAddressesActions } from '~/reducers/own-addresses/own-addresses.reducer'

import styles from './ConnectLedgerModal.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'


type Props = {
  t: any,
  actions: object,
  connectLedgerModal: object
}

/**
 * @class ConnectLedgerModal
 * @extends {Component<Props>}
 */
class ConnectLedgerModal extends Component<Props> {
	props: Props

  componentDidMount(){
    if(this.props.connectLedgerModal.isLedgerResistanceAppOpen){
      this.props.actions.stopLedgerPolling()
    }
  }

  componentWillUnmount() {
    this.props.actions.startLedgerPolling()
  }

  onDestAddressInputChanged(value) {
    this.props.actions.updateDestinationAddress(value)
  }

  onAmountAddressInputChanged(value) {
    this.props.actions.updateDestinationAmount(Decimal(value))
  }

  eventConfirm(event) {
    event.preventDefault()
    event.stopPropagation()
  }

  onSendButtonClicked(event) {
    this.eventConfirm(event)
    const state = this.props.connectLedgerModal
    if(!state.destinationAddress || (state.destinationAddress.charAt(0) !== 'r') || (state.destinationAddress.length !== 35)){
      this.props.actions.sendLedgerTransactionInvalidParams()
    } else if(!state.destinationAmount || state.destinationAmount.isNaN() || state.destinationAmount.isZero() || state.destinationAmount.isNegative()){
      this.props.actions.sendLedgerTransactionInvalidParams()
    } else {
      this.props.actions.sendLedgerTransaction()
    }
  }

  onViewTransactionDetails(){
    const blockchainExplorerUrl = `http://54.91.60.116:3001`
    const { txid } = this.props.connectLedgerModal
    const url = `${blockchainExplorerUrl}/insight/tx/${txid}`
    log.debug(`Transaction details URL`, blockchainExplorerUrl)
    shell.openExternal(url)
  }

  getConnectLedgerContent() {
    const { t } = this.props

    return (
      <div>
        <ul className={styles.stepsList}>
          <li>
            <div className={cn(styles.icon, styles.connectIcon)} />
            <div className={styles.description}>
              {t(`Connect and unlock your Ledger device`)}
            </div>
            <div className={cn('icon', styles.mark, {[styles.active]: this.props.connectLedgerModal.isLedgerConnected})} />
          </li>
          <li>
            <div className={cn(styles.icon, styles.navigateIcon)} />
            <div className={styles.description}>
              {t(`Navigate to the Resistance app on your device`)}
            </div>
            <div className={cn('icon', styles.mark, {[styles.active]: this.props.connectLedgerModal.isLedgerResistanceAppOpen})} />
          </li>
        </ul>

      </div>
    )
  }

  getConfirmTransactionContent() {
    const { t } = this.props

    return (
      <div>
        <div className={styles.title}>
          <div className={cn(styles.icon, styles.ledgerIcon)} />
          {t(`Send Currency from Ledger Nano S`)}
        </div>

        <div className={styles.title}>
          {t(`Please confirm transaction on Ledger`)}
        </div>

        <div className={styles.transactionDetailsContainer}>
          {t(`Your Ledger Address: ${this.props.connectLedgerModal.ledgerAddress}`)}
        </div>

        <div className={styles.transactionDetailsContainer}>
          {t(`Destination Address: ${this.props.connectLedgerModal.destinationAddress}`)}

        </div>

        <div className={styles.transactionDetailsContainer}>
          {t(`Destination Amount: ${this.props.connectLedgerModal.destinationAmount.toNumber()}`)}
        </div>

        <div className={styles.transactionDetailsContainer}>
          {t(`Transaction Fee: 0.0001`)}
        </div>
      </div>
    )
  }

  createTransaction() {
    const { t } = this.props
    if(this.props.connectLedgerModal.pollForLedger){
      this.props.actions.stopLedgerPolling()
    }
    return (
        <div className={[styles.sendCashContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>

          <div className={[HLayout.hBoxChild, VLayout.vBoxContainer, styles.wrapperContainer].join(' ')}>
            <div className={styles.title}>
              <div className={cn(styles.icon, styles.ledgerIcon)} />
              {t(`Send RES from Ledger Nano S`)}
            </div>

            <div className={styles.balanceContainer}>
              {t(`Ledger Address Balance: ${this.props.connectLedgerModal.ledgerBalance}`)}
            </div>

            {/* From address */}
            <div>
              <RoundedInput readOnly
                name="from"
                defaultValue={this.props.connectLedgerModal.ledgerAddress}
                label={t(`From address`)}
                className={styles.destinationAddressInput}
                labelClassName={styles.inputLabel}
              />

            {/* Destination address */}
            <RoundedInput
              name="destination"
              className={styles.destinationAddressInput}
              defaultValue=""
              labelClassName={styles.inputLabel}
              label={t(`Destination address`)}
              onChange={value => this.onDestAddressInputChanged(value)}
            />

            {/* Amount */}
            <div className={styles.amountContainer}>
              <RoundedInput
                name="amount"
                defaultValue=""
                label={t(`Amount`)}
                labelClassName={styles.inputLabel}
                number
                onChange={value => this.onAmountAddressInputChanged(value)}
              />
            </div>

            {/* Send button row */}
              <div className={styles.viewDetailsButton}>
                <RoundedButton
                  type="submit"
                  name="send-cash"
                  className={styles.viewDetailsButton}
                  disabled={this.props.connectLedgerModal.isTransactionPending}
                  onClick={event => this.onSendButtonClicked(event)}
                  important
                  large
                >
                  {t(`Send`)}
                </RoundedButton>
            </div>
          </div>
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
          {t(`Transaction sent! Transaction Id: ${this.props.connectLedgerModal.txid}`)}
        </div>

        <div className={styles.note}>
          {t(`Your account balance will update once the blockchain has confirmed the transaction`)}
        </div>

        <RoundedButton
          className={styles.viewDetailsButton}
          onClick={() => this.onViewTransactionDetails()}
          important
        >
          {t(`View details`)}
        </RoundedButton>

      </div>
    )
  }

	render() {
    const { t } = this.props

    const {
      isLedgerConnected,
      isTransactionSent,
      isLedgerResistanceAppOpen,
      isTransactionPending
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

          <div className={styles.title}>
            <div className={cn(styles.icon, styles.ledgerIcon)} />
            {t(`Send RES from Ledger`)}
          </div>

          { (!isLedgerConnected || !isLedgerResistanceAppOpen) && (!isTransactionPending || !isTransactionSent) && this.getConnectLedgerContent() }

          { (isLedgerConnected && isLedgerResistanceAppOpen && !isTransactionPending) && (!isTransactionPending && !isTransactionSent) && this.createTransaction()}

          { !isTransactionSent && isTransactionPending && this.getConfirmTransactionContent() }

          { !isTransactionPending && isTransactionSent && this.getTransactionSentContent() }

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
