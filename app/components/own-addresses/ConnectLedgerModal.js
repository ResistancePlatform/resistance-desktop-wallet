// @flow
import React, { Component} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import { shell } from 'electron';

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

  /*state = {
    timer: null
  }*/

  //blockchainExplorerIP: "http://54.91.60.116:3001"

  componentDidMount(){
    /*if(!this.props.connectLedgerModal.isLedgerResistanceAppOpen){
      let timer = setInterval(() => {this.tick(this)}, 500)
      this.setState({timer})
    }*/
  }

  componentWillUnmount() {
    //clearInterval(this.state.timer)
  }

  /*tick() {
    if(!this.props.connectLedgerModal.isLedgerResistanceAppOpen){
      this.props.actions.getLedgerConnected()
    } else {
      clearInterval(this.state.timer)
    }
  }*/


  onDestAddressInputChanged(value) {
    //getStore().dispatch(SendCashActions.checkAddressBookByName())
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
    //this.eventConfirm(event)
    let url = "http://54.91.60.116:3001" + "/insight/tx/" + this.props.connectLedgerModal.txid
    console.log(url)
    shell.openExternal(url) //`${this.blockchainExplorerIP} + /insight/tx/ + ${this.props.connectLedgerModal.txid}`)
    //getStore().dispatch(this.props.actions.closeConnectLedgerModal())
  }

  getConnectLedgerContent() {
    const { t } = this.props

    return (
      <div>
        <div className={styles.title}>
          {t(`Send RES from Ledger`)}
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

        {/*<RoundedButton
          className={styles.continueButton}
          onClick={this.props.actions.getLedgerConnected}
          important
        >
          {t(`Connect`)}
        </RoundedButton>*/}
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

    return (
        <div className={[styles.sendCashContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>

          <div className={[HLayout.hBoxChild, VLayout.vBoxContainer, styles.wrapperContainer].join(' ')}>
            {/* Title bar */}
            <div className={styles.titleBar}>{t(`Send Currency from Ledger Nano S`)}</div>

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
              >
              </RoundedInput>

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

           {/* <div className={styles.transactionFeeContainer}>
              <span className={styles.part1}>{t(`Transaction fee:`)} </span>
              <span className={styles.part2}>{DECIMAL.transactionFee.toString()}</span>
              <span className={styles.part3}>RES</span>
            </div>*/}

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
    const {
      isLedgerConnected,
      isTransactionConfirmed,
      isTransactionSent,
      isLedgerResistanceAppOpen,
      isTransactionPending
    } = this.props.connectLedgerModal

		return (
      <div className={styles.overlay}>
        <div key={location.pathname} className={cn(styles.container, styles.connectLedger)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeConnectLedgerModal}
            onKeyDown={() => {}}
          />

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
