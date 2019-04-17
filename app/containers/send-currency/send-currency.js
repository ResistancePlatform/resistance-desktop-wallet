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
import { SendCurrencyActions, SendCurrencyState } from '~/reducers/send-currency/send-currency.reducer'

import styles from './send-currency.scss'
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
	sendCurrency: SendCurrencyState
}

/**
 * @class SendCurrency
 * @extends {Component<Props>}
 */
class SendCurrency extends Component<Props> {
	props: Props

	/**
	 * @memberof SendCurrency
	 */
	componentDidMount() {
    this.props.actions.checkAddressBookByName()
	}

	getDropdownAddresses() {
    this.props.sendCurrency.addressList.map(address => (
      <PopupMenuItem key={address.address} onClick={() => this.props.actions.updateFromAddress(address.address)}>
        {address.address}
      </PopupMenuItem>
    ))
	}

	/**
	 * @returns
	 * @memberof SendCurrency
	 */
	render() {
    const { t } = this.props
    const { arePrivateTransactionsEnabled } = this.props.sendCurrency

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
                className={styles.input}
                labelClassName={styles.inputLabel}
                label={t(`From address`)}
              >
                <PopupMenu id={addressesPopupMenuId} relative>
                  {this.getDropdownAddresses()}
                </PopupMenu>

              </RoundedInputWithDropdown>

              {/* Toggle button */}
              <ToggleButton
                name="arePrivateTransactionsEnabled"
                switcherClassName={styles.toggleSwitcher}
                defaultValue={arePrivateTransactionsEnabled}
                label={t(`Private Transactions`)}
                captions={[t(`On`), t(`Off`)]}
              />
            </div>

						{/* Destination address */}
						<RoundedInputWithPaste
							name="destinationAddress"
              labelClassName={styles.inputLabel}
							label={t(`Destination address`)}
						/>

            <div className={styles.amountRow}>
              {/* Amount */}
              <CurrencyAmountInput
                className={styles.input}
                label={t(`Amount`)}
                labelClassName={styles.inputLabel}
                name="amount"
                symbol="RES"
              />

              <div className={styles.transactionFee}>
                <div className={styles.label}>
                  {t(`Transaction fee:`)}
                </div>

                <div className={styles.amount}>
                  {DECIMAL.transactionFee.toString()}
                </div>

                <div className={styles.symbol}>RES</div>
              </div>

            </div>

						{/* Send button row */}

            <div className={styles.submitRow}>
              <RoundedButton
                type="submit"
                onClick={this.props.actions.sendCurrency}
                important
              >
                {t(`Send`)}
              </RoundedButton>

              <div
                className={cn('icon', styles.privateIcon, {
                  [styles.locked]: arePrivateTransactionsEnabled
                })}
              />

              <div className={styles.hint}>{t('tip-r-to-r')}</div>
            </div>

            </RoundedForm>

						{/* Memo */}
						<div className={styles.memo}>
              <hr />

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
  sendCurrency: state.sendCurrency,
  form: state.roundedForm.sendCurrency
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(SendCurrencyActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('send-currency')(SendCurrency))
