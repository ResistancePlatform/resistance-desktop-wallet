// @flow
import { Decimal } from 'decimal.js'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { clipboard } from 'electron'
import { translate } from 'react-i18next'

import { TRANSACTION_FEE } from '~/constants'
import { appStore } from '~/state/store/configureStore'
import RoundedInput, { RoundedInputAddon } from '~/components/rounded-form/RoundedInput'
import AddressDropdownPopupMenu from '~/components/send-cash/address-drodown-popup-menu'
import { SendCashActions, SendCashState } from '~/state/reducers/send-cash/send-cash.reducer'

import styles from './send-cash.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'

type Props = {
  t: any,
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
    appStore.dispatch(SendCashActions.checkAddressBookByName())
	}

	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

	getPrivatelyToggleButtonClasses() {
		return this.props.sendCash.isPrivateTransactions
			? `${styles.toggleButton} ${styles.toggleButtonOn}`
			: `${styles.toggleButton}`
	}

	getSendLockClasses() {
		return this.props.sendCash.lockIcon === 'Lock' ? `icon-private-lock` : `icon-private-unlock`
	}

	onPrivateSendToggleClicked(event) {
		this.eventConfirm(event)
    appStore.dispatch(SendCashActions.togglePrivateSend())
	}

	onFromAddressDropdownClicked() {
		appStore.dispatch(SendCashActions.getAddressList(true))
		appStore.dispatch(SendCashActions.updateDropdownMenuVisibility(true))
	}

	onFromAddressInputChanged(value) {
		appStore.dispatch(SendCashActions.updateFromAddress(value))
	}

	onDestAddressPasteClicked() {
		appStore.dispatch(SendCashActions.updateToAddress(clipboard.readText()))
	}

	onDestAddressInputChanged(value) {
    appStore.dispatch(SendCashActions.checkAddressBookByName())
		appStore.dispatch(SendCashActions.updateToAddress(value))
	}

	onAmountAddressInputChanged(value) {
		appStore.dispatch(SendCashActions.updateAmount(Decimal(value)))
	}

	onSendButtonClicked(event) {
		this.eventConfirm(event)
		appStore.dispatch(SendCashActions.sendCash())
	}

	getDropdownMenuStyles() {
		return this.props.sendCash.showDropdownMenu ? 'block' : 'none'
	}

	commonMenuItemEventHandler(event) {
		this.eventConfirm(event)
		appStore.dispatch(SendCashActions.updateDropdownMenuVisibility(false))
	}

	hideDropdownMenu(event) {
		this.commonMenuItemEventHandler(event)
	}

	onPickupAddressHandler(event, selectedAddress: string) {
		this.commonMenuItemEventHandler(event)

		if (!selectedAddress || selectedAddress.trim() === '') return

		appStore.dispatch(SendCashActions.updateFromAddress(selectedAddress))
	}

	/**
	 * @returns
	 * @memberof SendCash
	 */
	render() {
    const { t } = this.props

		const fromAddressAddon: RoundedInputAddon = {
			enable: true,
			type: 'DROPDOWN',
			onClick: this.onFromAddressDropdownClicked
		}

		const destAddressAddon: RoundedInputAddon = {
			enable: true,
			type: 'PASTE',
			onClick: () => this.onDestAddressPasteClicked()
		}

		const amountAddressAddon: RoundedInputAddon = {
			enable: true,
			type: 'TEXT_PLACEHOLDER',
			value: 'RES',
			onClick: () => { }
		}

		return (
			// Layout container
			<div
        role="none"
				className={[styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}
				onClick={(event) => this.hideDropdownMenu(event)}
				onKeyDown={() => { }}
			>
				{/* Route content */}
				<div className={[styles.sendCashContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>

					<div className={[HLayout.hBoxChild, VLayout.vBoxContainer, styles.wrapperContainer].join(' ')}>
						{/* Title bar */}
						<div className={styles.titleBar}>{t(`Send Cash`)}</div>

						{/* From address */}
						<div className={styles.fromAddressContainer}>
							<RoundedInput
								name="from-address"
                defaultValue={this.props.sendCash.fromAddress}
								label={t(`From address`)}
								addon={fromAddressAddon}
								disabled={this.props.sendCash.isInputDisabled}
								tooltip={this.props.sendCash.inputTooltips}
								onChange={value => this.onFromAddressInputChanged(value)}
							>
								{/* Dropdown menu container */}
								<div className={styles.dropdownMenu} style={{ display: this.getDropdownMenuStyles() }}>
									<AddressDropdownPopupMenu
										addressList={this.props.sendCash.addressList}
										onPickupAddress={(event, address) => this.onPickupAddressHandler(event, address)}
									/>re
								</div>
							</RoundedInput>

							{/* Toggle button */}
							<div className={[styles.sendPrivatelyToggleContainer, HLayout.hBoxContainer].join(' ')}>
								<div className={styles.sendPrivateTitle}>{t(`Private Transactions`)}</div>

								<div
                  role="button"
                  tabIndex={0}
                  disabled={this.props.sendCash.isInputDisabled}
									className={this.getPrivatelyToggleButtonClasses()}
									onClick={event => this.onPrivateSendToggleClicked(event)}
									onKeyDown={event => this.onPrivateSendToggleClicked(event)}
								>
									<div className={styles.toggleButtonSwitcher} />
									<div className={styles.toggleButtonText}>
										{this.props.sendCash.isPrivateTransactions ? t(`On`): t(`Off`)}
									</div>
								</div>
							</div>
						</div>

						{/* Destination address */}
						<RoundedInput
							name="destination-address"
              defaultValue={this.props.sendCash.toAddress}
							label={t(`Destination address`)}
							addon={destAddressAddon}
              disabled={this.props.sendCash.isInputDisabled}
							tooltip={this.props.sendCash.inputTooltips}
							onChange={value => this.onDestAddressInputChanged(value)}
						/>

						{/* Amount */}
						<div className={styles.amountContainer}>
							<RoundedInput
								name="amount"
                defaultValue={this.props.sendCash.amount.toString()}
								label={t(`Amount`)}
								addon={amountAddressAddon}
                disabled={this.props.sendCash.isInputDisabled}
								onChange={value => this.onAmountAddressInputChanged(value)}
                number
							/>
							<div className={styles.transactionFeeContainer}>
								<span className={styles.part1}>{t(`Transaction fee:`)} </span>
								<span className={styles.part2}>{TRANSACTION_FEE.toString()}</span>
								<span className={styles.part3}>RES</span>
							</div>
						</div>

						{/* Send button row */}
						<div className={[styles.sendButtonContainer, HLayout.hBoxContainer].join(' ')}>
							<button
                type="button"
								name="send-cash"
								disabled={this.props.sendCash.isInputDisabled}
								onClick={event => this.onSendButtonClicked(event)}
								onKeyDown={event => this.onSendButtonClicked(event)}
							>
                {t(`Send`)}
							</button>
							<div className={[styles.desc, HLayout.hBoxContainer].join(' ')}>
								<div className={styles.descIcon}>
									<i className={this.getSendLockClasses()} />
								</div>
								<div className={styles.descContent}>{this.props.sendCash.lockTips || t('tip-r-to-r') }</div>
							</div>
						</div>

						{/* Memo */}
						<div className={styles.memoConatiner}>
							<span className={styles.memoTitle}>{t(`Memo:`)}</span>
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

export default connect(mapStateToProps, null)(translate('send-cash')(SendCash))
