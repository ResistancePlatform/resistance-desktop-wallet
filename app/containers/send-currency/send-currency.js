// @flow
import * as Joi from 'joi'
import cn from 'classnames'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'

import { DECIMAL } from '~/constants/decimal'
import { truncateAmount } from '~/utils/decimal'
import ValidateAddressService from '~/service/validate-address-service'
import { Address } from '~/components/address/Address'
import {
  RoundedForm,
  RoundedInput,
  RoundedInputWithPaste,
  RoundedInputWithDropdown,
  CurrencyAmountInput,
  ToggleButton,
  RoundedButton
} from '~/components/rounded-form'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import { PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'
import { SendCurrencyActions, SendCurrencyState } from '~/reducers/send-currency/send-currency.reducer'

import styles from './send-currency.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'

const validateAddress = new ValidateAddressService()

const getValidationSchema = t => Joi.object().keys({
  fromAddress: (
    validateAddress.getJoi()
    .resistanceAddress()
    .rZ().rLength().zLength().valid()
    .required().label(t(`From address`))
  ),
  toAddress: (
    validateAddress.getJoi()
    .resistanceAddress()
    .disallow(Joi.ref('fromAddress'))
    .options({
      language: {
        any: {
          invalid: t(`Destination and source addresses cannot be the same`)
        }
      }
    })
    .rZ().rLength().zLength().valid()
    .required().label(t(`Destination address`))
  ),
  amount: Joi.number().min(0).required().label(t(`Amount`)),
})

const addressesPopupMenuId = 'send-currency-addresses-dropdown-id'

const isPrivateAddress = (address?: string) => address && address.startsWith('z')
const isTransparentAddress = (address?: string) => address && address.startsWith('r')

type Props = {
  t: any,
  actions: object,
  form: any,
  popupMenu: PopupMenuActions,
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
    this.props.actions.getAddresses()
	}

	getDropdownAddresses() {
    const { t } = this.props
    const { arePrivateTransactionsEnabled, addresses } = this.props.sendCurrency
    const isAddressDisabled = address => address.startsWith('z') && !arePrivateTransactionsEnabled
    const { addressSearchString } = this.props.sendCurrency

    const filteredAddresses = addresses.filter(address => (
      (address.name || '').toLowerCase().includes(addressSearchString.toLowerCase())
    ))

    return filteredAddresses.map(address => (
      <PopupMenuItem
        key={address.address}
        disabled={isAddressDisabled(address.address)}
        onClick={() => this.props.actions.updateFromAddress(address.address)}
        tooltip={isAddressDisabled(address.address) && t(`Please enable Private Transactions to use Z-addresses`)}
      >
        <div className={styles.item}>
          <Address className={styles.address} value={address.address} />

          <div className={styles.name}>
            {address.name}
          </div>

          <div className={styles.balance}>
            {address.balance === null
              ? t('Error')
              : `${truncateAmount(address.balance)} RES`}
          </div>

        </div>

      </PopupMenuItem>
    ))
	}

  getInputTooltip() {
    const { t } = this.props

    const { arePrivateTransactionsEnabled } = this.props.sendCurrency

    if (arePrivateTransactionsEnabled || !this.props.form) {
      return null
    }

    const { fromAddress, toAddress } = this.props.form.fields

    if (isTransparentAddress(fromAddress) && isPrivateAddress(toAddress)) {
      return t(`Sending currency from a transparent (R) address to a private (Z) address is forbidden when "Private Transactions" are disabled.`)
    }

    if (isPrivateAddress(fromAddress) && isPrivateAddress(toAddress)) {
      return t(`Sending currency from a private (Z) address to a private (Z) address is forbidden when "Private Transactions" are disabled.`)
    }

    if (isPrivateAddress(fromAddress) && isTransparentAddress(toAddress)) {
      return t(`Sending currency from a private (Z) address to a transparent (R) address is forbidden when "Private Transactions" are disabled.`)
    }

    return null
  }

  getHint(): string {
    const { t } = this.props

    if (!this.props.form) {
      return t('tip-r-to-r')
    }

    const { fromAddress, toAddress } = this.props.form.fields

    if (isTransparentAddress(fromAddress) && isPrivateAddress(toAddress)) {
      return t('tip-r-to-z')
    }

    if (isPrivateAddress(fromAddress) && isPrivateAddress(toAddress)) {
      return t('tip-z-to-z')
    }

    if (isPrivateAddress(fromAddress) && isTransparentAddress(toAddress)) {
      return t('tip-z-to-r')
    }

    if (isTransparentAddress(fromAddress) && isTransparentAddress(toAddress)) {
      return t('tip-r-to-r')
    }

    return t('tip-r-to-r')
  }

  getIsLocked(): boolean {
    if (!this.props.form) {
      return true
    }
    const { fromAddress, toAddress } = this.props.form.fields
    return isPrivateAddress(fromAddress) && isPrivateAddress(toAddress) || false
  }

	/**
	 * @returns
	 * @memberof SendCurrency
	 */
	render() {
    const { t } = this.props
    const {
      isSubmitting,
      arePrivateTransactionsEnabled
    } = this.props.sendCurrency

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
                defaultValue={this.props.sendCurrency.fromAddress}
                labelClassName={styles.inputLabel}
                label={t(`From address`)}
                tooltip={this.getInputTooltip()}
                onDropdownClick={() => (
                  this.props.actions.updateAddressSearchString('') &&
                  this.props.popupMenu.show(addressesPopupMenuId)
                )}
              >
                <PopupMenu
                  id={addressesPopupMenuId}
                  className={styles.dropdownMenu}
                  relative
                >
                  <RoundedInput
                    className={styles.searchInput}
                    placeholder={t(`Search name in addressbook`)}
                    onChange={value => this.props.actions.updateAddressSearchString(value)}
                  />
                  {this.getDropdownAddresses()}

                </PopupMenu>

              </RoundedInputWithDropdown>

              {/* Toggle button */}
              <ToggleButton
                name="arePrivateTransactionsEnabled"
                className={styles.toggleButton}
                switcherClassName={styles.toggleSwitcher}
                defaultValue={arePrivateTransactionsEnabled}
                label={t(`Private Transactions`)}
                captions={[t(`On`), t(`Off`)]}
                onChange={this.props.actions.togglePrivateTransactions}
              />
            </div>

						{/* Destination address */}
						<RoundedInputWithPaste
							name="toAddress"
              labelClassName={styles.inputLabel}
							label={t(`Destination address`)}
              tooltip={this.getInputTooltip()}
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
                disabled={isSubmitting}
              >
                {t(`Send`)}
              </RoundedButton>

              <div
                className={cn('icon', styles.privateIcon, {
                  [styles.locked]: this.getIsLocked()
                })}
              />

              <div className={styles.hint}>
                {this.getHint()}
              </div>
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
  popupMenu: bindActionCreators(PopupMenuActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('send-currency')(SendCurrency))
