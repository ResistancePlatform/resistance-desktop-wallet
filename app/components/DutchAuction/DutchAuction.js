// @flow
import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import { clipboard } from 'electron'
import { toastr } from 'react-redux-toastr'
import log from 'electron-log'
import cn from 'classnames'

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

import animatedSpinner from '~/assets/images/animated-spinner.svg'
import styles from './DutchAuction.scss'

type Props = {
  t: any,
  i18n: any,
  dutchAuction: DutchAuctionState,
  actions: object
}

const kycUrl = 'https://lbt95atwl1.execute-api.us-east-1.amazonaws.com/api/v1/kyc'

const calculatePayout = (committed, price) => (
  committed && price && !price.isZero()
    ? committed.dividedBy(price)
    : null
)

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

  getSpinner() {
    const { t } = this.props
    return (
      <img
        className={styles.spinner}
        src={animatedSpinner}
        alt={t(`Loading...`)}
      />
    )
  }

  amountToCaption(amount) {
    return amount ? toDecimalPlaces(amount) : this.getSpinner()
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

    return null
  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getPre() {
    const { t } = this.props
    const { resAddress, status } = this.props.dutchAuction

    return (
      <React.Fragment>
        <div className={cn(styles.centerVertically, styles.innerContainer)}>
          <div className={styles.centeredTitle}>
            {t(`The auction starts in`)}
          </div>

          <Countdown
            className={styles.countdown}
            date={status.startTime}
            onStop={this.props.actions.getAuctionStatus}
          />

          <div className={styles.payoutAddressContainer}>
            {this.getAddressControl(t(`RES payout address`), resAddress, true, true)}
          </div>

        </div>

        {this.getIntroductoryNote()}

      </React.Fragment>
    )
  }

  getAddressControl(label, address, centerLabel, capitalizeLabel) {
    const { t } = this.props

    return (
      <div className={styles.address}>
        <div className={cn(styles.label, {
          [styles.centered]: centerLabel,
          [styles.capitalized]: capitalizeLabel
        })}>
          {label}
        </div>

        <div className={styles.body}>
          <div className={styles.value}>
            {address || this.getSpinner()}
          </div>

          {address &&
            <div
              role="none"
              className={cn('icon', styles.copyButton)}
              onClick={() => { clipboard.writeText(address); toastr.success(t(`Copied to clipboard`)) }}
            />
          }
        </div>

      </div>
    )

  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getActive() {
    const { t } = this.props
    const { resAddress, user, status } = this.props.dutchAuction

    const totalExpectedPayout = calculatePayout(status.ethCommitted, status.currentPrice)
    const userExpectedPayout = calculatePayout(user.ethCommitted, status.currentPrice)
    const nextPrice = status.currentPrice.minus(status.priceInterval)

    const isFinishing = status.currentRound === status.roundCount

    const countdownTime = isFinishing
      ? status.endTime
      : status.nextRoundTime

    return (
      <div className={cn(styles.activeAuction, styles.innerContainer)}>
        <div className={styles.title}>
          <div className={cn('icon', styles.check)} />
          {t(`The current auction is in progress`)}
        </div>

        <div className={styles.topContainer}>
          <div className={cn(styles.panel, styles.ethAddressContainer)}>
              {this.getAddressControl(t(`Address to send Ethereum to`), user.ethAddress, false, true)}

              <div className={styles.committed}>
                <div className={styles.label}>
                  {t(`You committed`)}
                </div>

                <div className={styles.body}>
                  {this.amountToCaption(user.ethCommitted)}&nbsp;
                  ETH
                </div>
              </div>

          </div>

          <ul className={styles.list}>
            <li>
              <span>{t(`Current price`)}:</span>
              {this.amountToCaption(status.currentPrice)} ETH
            </li>
            <li>
              <span>{t(`Reserve price`)}:</span>
              {this.amountToCaption(status.reservePrice)} ETH
            </li>
            <li>
              <span>{t(`Total committed`)}:</span> {this.amountToCaption(status.ethCommitted)} ETH
            </li>
            <li>
              <span>{t(`Your expected RES payout`)}:</span> {this.amountToCaption(userExpectedPayout)} RES
            </li>
            <li>
              <span>{t(`Total expected RES payout`)}:</span> {this.amountToCaption(totalExpectedPayout)} RES
            </li>
            <li>
              {this.getAddressControl(t(`RES payout address`), resAddress, false, false)}
            </li>
          </ul>

        </div>

        <hr />

        <div className={styles.centeredTitle}>
          {!isFinishing &&
            t(`The price will decrease to {{nextPrice}} Ethereum (ETH) in`, {nextPrice: this.amountToCaption(nextPrice)})
          }

          {isFinishing &&
            t(`The auction will finish in`)
          }

        </div>

        <Countdown
          className={styles.countdown}
          date={countdownTime}
          onStop={this.props.actions.getAuctionStatus}
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
    const { i18n } = this.props
    const { resAddress, user, status } = this.props.dutchAuction

    const resToPayOut = calculatePayout(user.ethCommitted, status.finalPrice)

    return (
      <React.Fragment>
        <div className={cn(styles.centerVertically, styles.innerContainer)}>
          <div className={styles.centeredTitle}>
            <div className={cn('icon', styles.check)} />
            {t(`The auction has finished`)}
          </div>

          <div className={cn(styles.panel, styles.finishedListContainer)}>
            <ul className={styles.list}>
              <li>
                <span>{t(`Finish time`)}:</span>
                {moment(status.finishTime)
                  .locale(i18n.language)
                  .format('MMMM Do YYYY, h:mm:ss a')
                }
              </li>
              <li>
                <span>{t(`Final price`)}:</span> {this.amountToCaption(status.finalPrice)} ETH per RES
              </li>
              <li>
                <span>{t(`Your RES to payout`)}:</span>
                {this.amountToCaption(resToPayOut)}
              </li>
              <li>
                {this.getAddressControl(t(`RES payout address`), resAddress, false, false)}
              </li>
            </ul>
          </div>

        </div>

        <div className={styles.note}>
          <strong>{t(`Note`)}:</strong>&nbsp;
          {t(`No RES will be paid out until 48 hours after the final round of the Resistance Dutch Auction.`)}&nbsp;
          {t(`This is estimated to be (at latest) August 25, 2019.`)}&nbsp;
          {t(`The RES coins will be paid out to the RES address specified above.`)}&nbsp;
        </div>

      </React.Fragment>
    )
  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getIntroductoryNote() {
    const { t } = this.props

    // const getTimeCaption = time => (
    //   moment(time)
    //   .locale(i18n.language)
    //   .format('MMMM Do YYYY, h:mm:ss a')
    // )

    return (
      <div className={styles.note}>
        <strong>{t(`Note`)}:</strong>&nbsp;
        {t(`There will be four auctions in total, with the first taking place on 2nd August 2019.`)}&nbsp;
        {t(`Following that, there will be a week’s interval before the second auction, another week before third, and another week before the final auction.`)}&nbsp;
        {t(`Only after the final auction ends will the Resistance IEO complete.`)}&nbsp;
        {t(`Before you can participate in an auction, you'll need to pass KYC verification.`)}&nbsp;
        {t(`Let’s get started!`)}
      </div>
    )

  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getAddressGeneration() {
    const { t } = this.props

    const { status, isGeneratingAddress } = this.props.dutchAuction

    if (status && status.nextRoundTime) {
      log.debug(`Timestamp:`, status.nextRoundTime.toString())
    }

    return (
      <div className={styles.addressGeneration}>
          <div className={styles.breadCrumbs}>
            <div className={styles.active}>
              1. {t(`Introduction`)}
            </div>
            <div>
              2. {t(`Get Verified`)}
            </div>
            <div>
              3. {t(`Register`)}
            </div>
          </div>

          <div className={cn(styles.centerVertically, styles.innerContainer)}>
            {this.getStatusSummary()}

            <div className={styles.buttons}>
              <RoundedButton
                onClick={this.props.actions.generateResAddress}
                important
                disabled={isGeneratingAddress}
                spinner={isGeneratingAddress}
              >
                {t(`Get Verified`)}
              </RoundedButton>
            </div>

          </div>

          {this.getIntroductoryNote()}

        </div>
    )
  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getKyc() {
    const { t } = this.props

    return (
      <div className={styles.kycContainer}>
        <div className={styles.breadCrumbs}>
          <div>
            1. {t(`Introduction`)}
          </div>
          <div className={styles.active}>
            2. {t(`Get Verified`)}
          </div>
          <div>
            3. {t(`Register`)}
          </div>
        </div>

        <div className={styles.kycWrapper}>
          <Kyc
            className={styles.kyc}
            url={kycUrl}
            submitCallback={this.props.actions.submitKycData}
          />

        </div>

      </div>
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
      <div className={styles.register}>
        <div className={styles.breadCrumbs}>
          <div>
            1. {t(`Introduction`)}
          </div>
          <div>
            2. {t(`Get Verified`)}
          </div>
          <div className={styles.active}>
            3. {t(`Register`)}
          </div>
        </div>

        <div className={cn(styles.centerVertically, styles.innerContainer)}>
          <div className={styles.centeredTitle}>
            {t(`Almost done!`)}
          </div>

          {this.getStatusSummary()}

          <div className={styles.buttons}>
            <RoundedButton
              onClick={this.props.actions.register}
              important
              disabled={isRegistering}
              spinner={isRegistering}
            >
              {t(`Register for the auction`)}
            </RoundedButton>
          </div>

        </div>

        {this.getIntroductoryNote()}

      </div>
    )
  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getStatusSummary() {
    const { t } = this.props
    const { status: auction } = this.props.dutchAuction

    return (
      <div className={styles.statusSummary}>
      {auction.status === 'pre' && (
        <React.Fragment>
          <div className={styles.centeredTitle}>
            {t(`The auction starts in`)}
          </div>

          <Countdown
            className={styles.countdown}
            date={auction.startTime}
          />
        </React.Fragment>
      )}

      {auction.status === 'active' && (
        <React.Fragment>
          <div className={cn(styles.status, styles.active)}>
            <div className={cn('icon', styles.icon)} />
            {t(`The auction is in progress`)}
          </div>

          <div className={styles.centeredTitle}>
            {t(`The price will decrease in`)}
          </div>

          <Countdown
            className={styles.countdown}
            date={auction.nextRoundTime}
          />
        </React.Fragment>
      )}

      {auction.status === 'finished' && (
        <React.Fragment>
          <div className={cn(styles.status)}>
            <div className={cn('icon', styles.icon)} />
            {t(`The auction is now complete`)}
          </div>

          <div className={styles.centeredTitle}>
            {t(`You can apply to participate in the next round here`)}
          </div>
        </React.Fragment>
      )}

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

    let contents = null

    const bootstrapping = this.getBootstrapping()

    if (bootstrapping !== null) {
      contents = bootstrapping
    } else {
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
    }

    return (
      <div className={styles.container}>
        <RpcPolling
          interval={60.0}
          actions={{
            polling: DutchAuctionActions.getAuctionStatus,
            success: DutchAuctionActions.gotAuctionStatus,
            failure: DutchAuctionActions.getAuctionStatusFailed,
          }}
        />
        <RpcPolling
          interval={61.0}
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

export default connect(mapStateToProps, mapDispatchToProps)(translate('other')(DutchAuction))
