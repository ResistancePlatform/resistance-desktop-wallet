// @flow
import * as Joi from 'joi'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'

import ValidateAddressService from '~/service/validate-address-service'
import {
  RoundedForm,
  RoundedButton,
  RoundedInputWithPaste,
} from '~/components/rounded-form'
import {
  DutchAuctionActions,
  DutchAuctionState
} from '~/reducers/dutch-auction/dutch-auction.reducer'
import { Kyc } from '~/components/Kyc/Kyc'

import styles from './DutchAuction.scss'

type Props = {
  t: any,
  dutchAuction: DutchAuctionState,
  actions: object
}

const kycUrl = 'https://kvk0a65tl4.execute-api.us-east-1.amazonaws.com/api'
const validateAddress = new ValidateAddressService()

const getValidationSchema = t => Joi.object().keys({
  resAddress: (
    validateAddress.getJoi()
    .resistanceAddress()
    .rZ().rLength().zLength().valid()
    .required().label(t(`RES address`))
  ),
})

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
  getPre() {
    const { resAddress, kyc, credentials } = this.props.dutchAuction

    if (resAddress === null) {
      return this.getResAddressForm()
    }

    if (kyc.tid === null) {
      return this.getKyc()
    }

    if (credentials.userId === null) {
      return this.getRegister()
    }

    return this.getCountdown()
  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getActive() {
    return null
  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getFinished() {
    return null
  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
  getResAddressForm() {
    const { t } = this.props

    return (
      <RoundedForm
        id="dutchAuctionResAddress"
        className={styles.form}
        schema={getValidationSchema(t)}
      >
        <div className={styles.title}>
          {t(`Specify Resistance address to recieve the payout`)}
        </div>

        <RoundedInputWithPaste
          name="resAddress"
          labelClassName={styles.inputLabel}
          label={t(`RES address`)}
        />

        <RoundedButton
          type="submit"
          onClick={this.props.actions.updateResAddress}
          important
        >
          {t(`Next`)}
        </RoundedButton>

      </RoundedForm>
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
    return null
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
