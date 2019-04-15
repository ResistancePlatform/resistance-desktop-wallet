// @flow
import * as Joi from 'joi'
import cn from 'classnames'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'

import { DECIMAL } from '~/constants/decimal'
import ValidateAddressService from '~/service/validate-address-service'
import {
  RoundedForm,
  RoundedInputWithPaste,
  RoundedInputWithDropdown,
  CurrencyAmountInput,
  ToggleButton,
  RoundedButton
} from '~/components/rounded-form'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import { SendCashActions, SendCashState } from '~/reducers/send-cash/send-cash.reducer'

import styles from './send-cash.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'

const validateAddress = new ValidateAddressService()

const getValidationSchema = t => Joi.object().keys({
  name: Joi.string().required().label(t(`Name`)),
  fromAddress: (
    validateAddress.getJoi()
    .resistanceAddress()
    .rZ().rLength().zLength().valid()
    .required().label(t(`From address`))
  ),
  arePrivateTransactionsEnabled: Joi.boolean().required(),
  destinationAddress: (
    validateAddress.getJoi()
    .resistanceAddress()
    .rZ().rLength().zLength().valid()
    .required().label(t(`Destination address`))
  ),
  amount: Joi.number().min(0).required().label(t(`Amount`)),
})

const addressesPopupMenuId = 'send-currency-addresses-dropdown-id'

type Props = {
  t: any,
  actions: object,
	sendCash: SendCashState
}

/**
 * @class SendCash
 * @extends {Component<Props>}
 */
class SendCash extends Component<Props> {
	props: Props

	/**
	 * @memberof SendCash
	 */
	componentDidMount() {
    this.props.actions.checkAddressBookByName()
	}

	getDropdownAddresses() {
    this.props.sendCash.addressList.map(address => (
      <PopupMenuItem key={address.address} onClick={() => this.props.actions.updateFromAddress(address.address)}>
        {address.address}
      </PopupMenuItem>
    ))
	}

	/**
	 * @returns
	 * @memberof SendCash
	 */
	render() {
    const { t } = this.props

		return (
			// Layout container
			<div
        role="none"
				className={cn(HLayout.hBoxChild, VLayout.vBoxContainer)}
			>

      <div className={cn(styles.container, VLayout.vBoxChild, HLayout.hBoxContainer)}>

        <div className={cn(styles.wrapper, HLayout.hBoxChild, VLayout.vBoxContainer)}>

						{ /* Top bar */}
						<div className={cn(styles.header, HLayout.hBoxContainer)}>
              <div className={styles.title}>{t(`Send Currency`)}</div>
						</div>

            <RoundedForm
              id="sendCurrency"
              className={styles.form}
              schema={getValidationSchema(t)}
            >

            <div className={styles.fromAddressRow}>
              {/* From address */}
              <RoundedInputWithDropdown
                name="fromAddress"
                label={t(`From address`)}
              >
                <PopupMenu id={addressesPopupMenuId} relative>
                  {this.getDropdownAddresses()}
                </PopupMenu>

              </RoundedInputWithDropdown>

              {/* Toggle button */}
              <ToggleButton
                name="arePrivateTransactionsEnabled"
                defaultValue={this.props.sendCash.arePrivateTransactionsEnabled}
                label={t(`Private Transactions`)}
              />
            </div>

						{/* Destination address */}
						<RoundedInputWithPaste
							name="destinationAddress"
							label={t(`Destination address`)}
						/>

            <div className={styles.amountRow}>
              {/* Amount */}
              <CurrencyAmountInput
                className={styles.amount}
                name="amount"
                symbol="RES"
              />

              <div className={styles.label}>
                {t(`Transaction fee:`)}
              </div>

              <div className={styles.fee}>
                {DECIMAL.transactionFee.toString()}
              </div>

              <div className={styles.symbol}>RES</div>

            </div>

						{/* Send button row */}

						<RoundedButton
							type="submit"
							onClick={this.props.actions.sendCash}
							important
						>
							{t(`Send`)}
						</RoundedButton>

						<div>{t('tip-r-to-r')}</div>

            </RoundedForm>

						{/* Memo */}
						<div className={styles.memo}>
							<div className={styles.label}>{t(`Memo:`)}</div>
              {t(`memo`)}
						</div>

					</div>
				</div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	sendCash: state.sendCash
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(SendCashActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('send-cash')(SendCash))
