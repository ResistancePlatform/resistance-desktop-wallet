// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'

import { toDecimalPlaces } from '~/utils/decimal'
import RpcPolling from '~/components/rpc-polling/rpc-polling'
import {
  RoundedButton,
} from '~/components/rounded-form'
import {
  DutchAuctionActions,
  DutchAuctionState
} from '~/reducers/dutch-auction/dutch-auction.reducer'
import { Kyc } from '~/components/Kyc/Kyc'
import Countdown from './Countdown'

import styles from './DutchAuction.scss'

type Props = {
  t: any,
  dutchAuction: DutchAuctionState,
  actions: object
}

const kycUrl = 'https://lbt95atwl1.execute-api.us-east-1.amazonaws.com/api/v1/kyc'

/**
 * @class DutchAuction
 * @extends {Component<Props>}
 */
export class DutchAuction extends Component<Props> {
	props: Props

	/**
	 * @memberof DutchAuction
	 */
  componentDidMount() {
    this.props.actions.getAuctionStatus()
  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getBootstrapping() {
    const { resAddress, kyc, credentials } = this.props.dutchAuction

    if (resAddress === null) {
      return this.getAddressGeneration()
    }

    if (kyc.tid === null) {
      return this.getKyc()
    }

    if (credentials.userId === null) {
      return this.getRegister()
    }

  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getPre() {
    const { t } = this.props
    const { resAddress } = this.props.dutchAuction

    return (
      <div className={styles.pre}>
        <div className={styles.title}>
          {t(`The auction starts in`)}
        </div>

        {this.getCountdown()}

        <ul className={styles.list}>
          <li>
            <span>{t(`RES payout address`)}:</span> {resAddress}
          </li>
        </ul>
      </div>
    )
  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getActive() {
    const { t } = this.props
    const { user, status } = this.props.dutchAuction

    return (
      <div className={styles.active}>
        <div className={styles.title}>
          {t(`The auction is active`)}
        </div>

        <ul className={styles.list}>
          <li>
            <span>{t(`Address to send Ethereum to`)}:</span> {user.ethAddress}
          </li>
          <li>
            <span>{t(`You committed`)}:</span> {user.ethCommitted} ETH
          </li>
          <li>
            <span>{t(`Total committed`)}:</span> {status.ethCommitted} ETH
          </li>
          <li>
            <span>{t(`Your expected RES payout`)}:</span> Fixme! RES
          </li>
          <li>
            <span>{t(`Total expected RES payout`)}:</span> Fixme! RES
          </li>
        </ul>

        <div className={styles.title}>
          {t(`Next price decrease`)}
        </div>

        <Countdown
          date="Thu Jul 25 2019 22:37:37 GMT+0200 (Central European Summer Time)"
        />

      </div>
    )
  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getFinished() {
    const { t } = this.props
    const { user, status } = this.props.dutchAuction

    const resToPayOut = user.ethCommited
      ? user.ethCommited.times(status.finalPrice)
      : null

    return (
      <div className={styles.finished}>
        <div className={styles.title}>
          {t(`The auction is finished`)}
        </div>

        <div className={styles.title}>
          {t(`Round {{currentRound}} of {{roundCount}}`, status)}
        </div>

        <ul className={styles.list}>
          <li>
            <span>{t(`Finish time`)}:</span> {status.finishTime}
          </li>
          <li>
            <span>{t(`Final price`)}:</span> {status.finalPrice} RES
          </li>
          <li>
            <span>{t(`RES sold`)}:</span> {status.resSold}
          </li>
          <li>
            <span>{t(`Your RES to payout`)}:</span>
            {resToPayOut
              ? toDecimalPlaces(resToPayOut)
              : t(`N/A`)
            }
          </li>
        </ul>

        <div className={styles.note}>
          <strong>{t(`Note`)}:</strong>
          {t(`No RES will be paid out until 48 hours after the *final* round of the Resistance Dutch Auction. The RES coins will be paid out to the RES address stated below`)}
        </div>

      </div>
    )
  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getAddressGeneration() {
    const { t } = this.props
    const { isGeneratingAddress } = this.props.dutchAuction.status

    return (
      <React.Fragment>
        {this.getCountdown()}

        <RoundedButton
          onClick={this.props.actions.generateResAddress}
          important
          disabled={isGeneratingAddress}
          spinner={isGeneratingAddress}
        >
          {t(`Register`)}
        </RoundedButton>

      </React.Fragment>
    )
  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getKyc() {
    return (
      <Kyc
        url={kycUrl}
        submitCallback={this.props.actions.submitKycData}
      />
    )
  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getRegister() {
    const { t } = this.props
    const { isRegistering } = this.props.dutchAuction

    return (
      <React.Fragment>
        {this.getCountdown()}

        <RoundedButton
          onClick={this.props.actions.register}
          important
          disabled={isRegistering}
          spinner={isRegistering}
        >
          {t(`Register for the auction`)}
        </RoundedButton>
      </React.Fragment>
    )
  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getCountdown() {
    return (
      <div className={styles.countdown}>
        Countdown
      </div>
    )
  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
	render() {
    const { status } = this.props.dutchAuction

    if (!status) {
      return null
    }

    status.status = 'pre'

    const bootstrapping = this.getBootstrapping()

    if (bootstrapping !== null) {
      return bootstrapping
    }

    let contents = null
    switch (status.status) {
      case 'pre':
        contents = this.getPre()
        break
      case 'active':
        contents = this.getActive()
        break
      case 'finished':
        contents = this.getFinished()
        break
      default:
        break
    }

    return (
      <div className={styles.container}>
        <RpcPolling
          interval={60.0}
          criticalChildProcess="RESDEX"
          actions={{
            polling: DutchAuctionActions.getAuctionStatus,
            success: DutchAuctionActions.gotAuctionStatus,
            failure: DutchAuctionActions.getAuctionStatusFailed,
          }}
        />
        <RpcPolling
          interval={61.0}
          criticalChildProcess="RESDEX"
          actions={{
            polling: DutchAuctionActions.getUserStatus,
            success: DutchAuctionActions.gotUserStatus,
            failure: DutchAuctionActions.getUserStatusFailed,
          }}
        />
        {contents}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  dutchAuction: state.dutchAuction,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(DutchAuctionActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(DutchAuction))
