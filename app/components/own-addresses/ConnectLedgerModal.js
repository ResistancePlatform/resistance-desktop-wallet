// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { getStore } from '~/store/configureStore'
import { RoundedButton } from '~/components/rounded-form'
import RoundedInput from '~/components/rounded-form/RoundedInput'
import { OwnAddressesActions } from '~/reducers/own-addresses/own-addresses.reducer'
import { DECIMAL } from '~/constants/decimal'

import styles from './ConnectLedgerModal.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'

import { Decimal } from 'decimal.js'


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

  onDestAddressInputChanged(value) {
    //getStore().dispatch(SendCashActions.checkAddressBookByName())
    getStore().dispatch(this.props.actions.updateDestinationAddress(value))
  }

  onAmountAddressInputChanged(value) {
    getStore().dispatch(this.props.actions.updateDestinationAmount(Decimal(value)))
  }

  eventConfirm(event) {
    event.preventDefault()
    event.stopPropagation()
  }

  onSendButtonClicked(event) {
    //this.eventConfirm(event)
    getStore().dispatch(this.props.actions.sendLedgerTransaction())
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
      </div>
    )
  }

  getConfirmTransactionContent() {
    const { t } = this.props

    return (
      <div>
        <div className={styles.titleBar}>{t(`Send Currency from Ledger Nano S`)}</div>
        <div className={styles.title}>
          {t(`Please confirm transaction on Ledger`)}
        </div>
        <div>
          {t(`Your Ledger Address: ${this.props.connectLedgerModal.ledgerAddress}`)}
        </div>
        <div>
          {t(`Destination Address: ${this.props.connectLedgerModal.destinationAddress}`)}
        </div>
        <div>
          {t(`Destination Amount: ${this.props.connectLedgerModal.destinationAmount.toNumber()}`)}
        </div>
        <div>
          {t(`Transaction Fee: 0.0001`)}
        </div>
      </div>
    )
  }

  createTransaction() {
    const { t } = this.props

    return (
        <div className={[styles.sendCashContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>

          <div className={[HLayout.hBoxChild, VLayout.vBoxContainer, styles.wrapperContainer].join(' ')}>
            {/* Title bar */}
            <div className={styles.titleBar}>{t(`Send Currency from Ledger Nano S`)}</div>

            {/* From address */}
            <div>
              <RoundedInput readOnly
                name="from-address"
                defaultValue={this.props.connectLedgerModal.ledgerAddress}
                label={t(`From address`)}
                labelClassName={styles.destinationAddressInput}
              >
              </RoundedInput>

            {/* Destination address */}
            <RoundedInput
              name="destination-address"
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
                labelClassName={styles.oldInputLabel}
                number
                onChange={value => this.onAmountAddressInputChanged(value)}
              />
            </div>

           {/* <div className={styles.transactionFeeContainer}>
              <span className={styles.part1}>{t(`Transaction fee:`)} </span>
              <span className={styles.part2}>{DECIMAL.transactionFee.toString()}</span>
              <span className={styles.part3}>RES</span>
            </div>*/}

            {/* Send button row */}
            <div className={[styles.sendButtonContainer, HLayout.hBoxContainer].join(' ')}>
              <RoundedButton
                type="submit"
                name="send-cash"
                spinner={this.props.connectLedgerModal.isTransactionPending}
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

          { (!isLedgerConnected || !isLedgerResistanceAppOpen) && this.getConnectLedgerContent() }

          { (isLedgerConnected && isLedgerResistanceAppOpen && !isTransactionPending) && this.createTransaction()}

          { isTransactionPending && this.getConfirmTransactionContent() }

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
