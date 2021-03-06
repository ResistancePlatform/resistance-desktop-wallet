// @flow
import { Decimal } from 'decimal.js'
import React, { Component} from 'react'
import log from 'electron-log'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import { shell } from 'electron'

import {
  RoundedButton,
  RoundedInput,
  RoundedInputWithPaste,
  CurrencyAmountInput
} from '~/components/rounded-form'
import { OwnAddressesActions } from '~/reducers/own-addresses/own-addresses.reducer'

import styles from './ConnectLedgerModal.scss'

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
    const blockchainExplorerUrl = `https://blockexplorer.resistance.io`
    const { txid } = this.props.connectLedgerModal
    const url = `${blockchainExplorerUrl}/tx/${txid}`
    log.debug(`Transaction details URL`, blockchainExplorerUrl)
    shell.openExternal(url)
  }

  getConnectLedgerContent() {
    const { t } = this.props

    return (
      <div>
        <div className={styles.title}>
          <div className={cn(styles.icon, styles.ledgerIcon)} />
          {t(`Connect Ledger`)}
        </div>

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

    // const details = (
    //   <div>
    //     <div className={styles.transactionDetailsContainer}>
    //       {t(`Your Ledger Address: ${this.props.connectLedgerModal.ledgerAddress}`)}
    //     </div>
    //
    //     <div className={styles.transactionDetailsContainer}>
    //       {t(`Destination Address: ${this.props.connectLedgerModal.destinationAddress}`)}
    //
    //     </div>
    //
    //     <div className={styles.transactionDetailsContainer}>
    //       {t(`Destination Amount: ${this.props.connectLedgerModal.destinationAmount.toNumber()}`)}
    //     </div>
    //
    //     <div className={styles.transactionDetailsContainer}>
    //       {t(`Transaction Fee: 0.0001`)}
    //     </div>
    //   </div>
    // )

    return (
      <div>
        <div className={styles.title}>
          <div className={cn(styles.icon, styles.ledgerIcon)} />
          {t(`Please confirm transaction on Ledger`)}
        </div>

        <div className={styles.illustration}>
          <div className={cn('icon', styles.mark)} />
        </div>

      </div>
    )
  }

  createTransaction() {
    const { t } = this.props
    const {
      pollForLedger,
      ledgerBalance,
      isTransactionPending,
      ledgerAddress
    } = this.props.connectLedgerModal

    if (pollForLedger) {
      this.props.actions.stopLedgerPolling()
    }

    return (
      <div>
        <div className={styles.title}>
          <div className={cn(styles.icon, styles.ledgerIcon)} />
          {t(`Send currency from Ledger Nano S`)}
        </div>

        <RoundedInputWithPaste
          name="destination"
          defaultValue=""
          labelClassName={styles.inputLabel}
          label={t(`Destination address`)}
          onChange={value => this.onDestAddressInputChanged(value)}
        />

        <RoundedInput readOnly
          name="from"
          defaultValue={ledgerAddress}
          labelClassName={styles.inputLabel}
          label={t(`From address`)}
        />

      <div className={styles.caption}>
        {t(`Amount`)}
      </div>

        <div className={styles.amountContainer}>

          <CurrencyAmountInput
            name="amount"
            className={styles.amountInput}
            defaultValue=""
            number
            onChange={value => this.onAmountAddressInputChanged(value)}
            maxAmount={ledgerBalance && Decimal(ledgerBalance)}
          />

          <div className={styles.balanceContainer}>
            <div className={styles.caption}>
              {t(`Available balance`) }
            </div>

            <div className={styles.balance}>
              {ledgerBalance}
            </div>

          </div>

        </div>

        <RoundedButton
          className={styles.sendButton}
          disabled={isTransactionPending}
          onClick={e => this.onSendButtonClicked(e)}
          important
          large
        >
          {t(`Send`)}
        </RoundedButton>
    </div>
    )
  }

  getTransactionSentContent() {
    const { t } = this.props

    // const { txid } = this.props.connectLedgerModal

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
          onClick={() => this.onViewTransactionDetails()}
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
      isTransactionSent,
      isLedgerResistanceAppOpen,
      isTransactionPending
    } = this.props.connectLedgerModal

    const showConnectLedger = (
      (!isLedgerConnected || !isLedgerResistanceAppOpen) &&
      (!isTransactionPending || !isTransactionSent)
    )

    const showCreateTransaction = (
      (isLedgerConnected && isLedgerResistanceAppOpen && !isTransactionPending) &&
      (!isTransactionPending && !isTransactionSent)
    )

    const showConfirmTransaction = !isTransactionSent && isTransactionPending

    const showTransactionSent = !isTransactionPending && isTransactionSent


		return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.sendRes, {
          [styles.connectLedger]: showConnectLedger,
          [styles.createTransaction]: showCreateTransaction,
          [styles.confirmTransaction]: showConfirmTransaction,
          [styles.transactionSent]: showTransactionSent
        })}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeConnectLedgerModal}
            onKeyDown={() => {}}
          />

          { showConnectLedger && this.getConnectLedgerContent() }

          { showCreateTransaction && this.createTransaction()}

          { showConfirmTransaction && this.getConfirmTransactionContent() }

          { showTransactionSent && this.getTransactionSentContent() }

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
