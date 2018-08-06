// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import RoundedInput, { RoundedInputAddon } from '../../components/rounded-input'
import AddressDropdownPopupMenu from '../../components/send-cash/address-drodown-popup-menu'
import { SendCashActions, SendCashState } from '../../state/reducers/send-cash/send-cash.reducer'
import { appStore } from '../../state/store/configureStore'
import styles from './send-cash.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'

type Props = {
	sendCash: SendCashState
}

/**
 * @class SendCash
 * @extends {Component<Props>}
 */
class SendCash extends Component<Props> {
	props: Props
	fromAddressInputDomRef: any
	toAddressInputDomRef: any
	amountInputDomRef: any

	constructor(props) {
		super(props)

		// create a ref to specified <input> which inside <RounedInput>
		this.fromAddressDomRef = (element) => { this.fromAddressInputDomRef = element };
		this.toAddressDomRef = (element) => { this.toAddressInputDomRef = element };
		this.amountAddressDomRef = (element) => { this.amountInputDomRef = element };
	}

	/**
	 * @memberof SendCash
	 */
	componentDidMount() {
		const currentAppState = appStore.getState()
		const currentSendCashState = currentAppState && currentAppState.sendCash ? currentAppState.sendCash : {
			fromAddress: '',
			toAddress: '',
			amount: 0
		}

		this.fromAddressInputDomRef.inputDomRef.current.value = currentSendCashState.fromAddress
		this.toAddressInputDomRef.inputDomRef.current.value = currentSendCashState.toAddress
		this.amountInputDomRef.inputDomRef.current.value = currentSendCashState.amount
	}

	/**
	 * @memberof SendCash
	 */
	componentWillUnmount() { }

	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

	getPrivatelyToggleButtonClasses() {
		return this.props.sendCash.isPrivateSendOn
			? `${styles.toggleButton} ${styles.toggleButtonOn}`
			: `${styles.toggleButton}`
	}

	getSendLockClasses() {
		return this.props.sendCash.isPrivateSendOn ? `icon-private-lock` : `icon-private-unlock`
	}

	getSendTips() {
		const prefixTips = `You are about to send money from`
		return this.props.sendCash.isPrivateSendOn
			? `${prefixTips} a Private (Z) address to another Private (Z) address. This transaction will be private and invisible to all other users.`
			: `${prefixTips} Transparent (K1,JZ) address to Transparent address. This transaction will be visible to everyone.`
	}

	getPrivatelyToggleButtonText() {
		return this.props.sendCash.isPrivateSendOn ? `ON` : `OFF`
	}

	onPrivateSendToggleClicked(event) {
		this.eventConfirm(event)
		const shouldDisableInput = Boolean(this.props.sendCash.currentOperation && this.props.sendCash.currentOperation.operationId)

		if (!shouldDisableInput) {
			appStore.dispatch(SendCashActions.togglePrivateSend())
		}
	}

	onFromAddressDropdownClicked() {
		appStore.dispatch(SendCashActions.getAddressList(true))
		appStore.dispatch(SendCashActions.updateDropdownMenuVisibility(true))
	}

	onFromAddressInputChanged(value) {
		appStore.dispatch(SendCashActions.updateFromAddress(value))
	}

	onDestAddressPasteClicked() {
		appStore.dispatch(SendCashActions.pasteToAddressFromClipboard())

		// Just a workaround at this moment!!!
		setTimeout(() => {
			const currentAppState = appStore.getState()
			this.toAddressInputDomRef.inputDomRef.current.value = currentAppState.sendCash.toAddress
		}, 100);
	}

	onDestAddressInputChanged(value) {
		appStore.dispatch(SendCashActions.updateToAddress(value))
	}

	onAmountAddressInputChanged(value) {
		appStore.dispatch(SendCashActions.updateAmount(parseFloat(value)))
	}

	onSendButtonClicked(event) {
		this.eventConfirm(event)
		appStore.dispatch(SendCashActions.sendCash())
	}

	getOperationProgressBarStyles() {
		const flexValue = this.props.sendCash.currentOperation.percent / 100
		return { flex: flexValue }
	}

	getDropdownMenuStyles() {
		return this.props.sendCash && this.props.sendCash.showDropdownMenu ? 'block' : 'none'
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

		// Update `<RounedInput> --> <input>` value manually, seems don't have the better option at this moment!!!
		this.fromAddressInputDomRef.inputDomRef.current.value = selectedAddress

		appStore.dispatch(SendCashActions.updateFromAddress(selectedAddress))
	}

	onSendFromRadioButtonChange(event, selectedValue: string) {
		appStore.dispatch(SendCashActions.updateSendFromRadioButtonType(selectedValue))
	}


	renderProgressRow() {
		if (!this.props.sendCash || !this.props.sendCash.currentOperation) {
			return null
		}
		return (
			<div className={[styles.processRow, VLayout.vBoxContainer].join(' ')}>
				<div className={[styles.row1, HLayout.hBoxContainer].join(' ')}>
					<div className={styles.processRow1Title}>LAST OPERATION STATUS: </div>
					<div className={styles.processRow1Status}>IN PROGRESS</div>
					<div
						className={[styles.processRow1Percent, HLayout.hBoxChild].join(' ')}
					>
						{this.props.sendCash.currentOperation.percent}%
					</div>
				</div>

				<div className={[styles.row2, HLayout.hBoxContainer].join(' ')}>
					<div
						className={styles.progressBarPercent}
						style={this.getOperationProgressBarStyles()}
					/>
				</div>
			</div>
		)
	}

	/**
	 * @returns
	 * @memberof SendCash
	 */
	render() {
		const fromAddressAddon: RoundedInputAddon = {
			enable: true,
			type: 'DROPDOWN',
			onAddonClicked: this.onFromAddressDropdownClicked
		}

		const destAddressAddon: RoundedInputAddon = {
			enable: true,
			type: 'PASTE',
			onAddonClicked: () => this.onDestAddressPasteClicked()
		}

		const amountAddressAddon: RoundedInputAddon = {
			enable: true,
			type: 'TEXT_PLACEHOLDER',
			value: 'RES',
			onAddonClicked: () => { }
		}

		const shouldDisableInput = Boolean(this.props.sendCash.currentOperation && this.props.sendCash.currentOperation.operationId)

		return (
			// Layout container
			<div
				className={[styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}
				onClick={(event) => this.hideDropdownMenu(event)}
				onKeyDown={() => { }}
			>
				{/* Route content */}
				<div className={[styles.sendCashContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>

					<div className={[HLayout.hBoxChild, VLayout.vBoxContainer, styles.wrapperContainer].join(' ')}>
						{/* Title bar */}
						<div className={styles.titleBar}>Send Cash</div>

						{/* Send from */}
						<div className={styles.sendFromContainer}>
							<div className={styles.sendFromTitle}>SEND FROM</div>

							<div className={styles.sendFromCheckboxContainer}>
								<div className={styles.radioButtonContainer}>
									<input
										readOnly
										id="radio1"
										type="radio"
										name="sendFromType"
										value="transparent"
										checked={
											this.props.sendCash.sendFromRadioButtonType ===
											'transparent'
										}
										onClick={event =>
											this.onSendFromRadioButtonChange(event, 'transparent')
										}
									/>
									<label htmlFor="radio1">
										<span>
											<span />
										</span>Transparent address
									</label>
								</div>
								<div className={styles.radioButtonContainer}>
									<input
										readOnly
										id="radio2"
										type="radio"
										name="sendFromType"
										value="private"
										checked={
											this.props.sendCash.sendFromRadioButtonType === 'private'
										}
										onClick={event =>
											this.onSendFromRadioButtonChange(event, 'private')
										}
									/>
									<label htmlFor="radio2">
										<span>
											<span />
										</span>Private address
									</label>
								</div>

							</div>
						</div>

						{/* From address */}
						<div className={styles.fromAddressContainer}>
							<RoundedInput
								name="from-address"
								title="FROM ADDRESS"
								addon={fromAddressAddon}
								disabled={shouldDisableInput}
								onInputChange={value => this.onFromAddressInputChanged(value)}
								ref={this.fromAddressDomRef}
							>
								{/* Dropdown menu container */}
								<div className={styles.dropdownMenu} style={{ display: this.getDropdownMenuStyles() }}>
									<AddressDropdownPopupMenu
										addressList={this.props.sendCash.addressList}
										onPickupAddress={(event, address) =>
											this.onPickupAddressHandler(event, address)
										}
									/>re
								</div>
							</RoundedInput>

							{/* Toggle button */}
							<div className={[styles.sendPrivatelyToggleContainer, HLayout.hBoxContainer].join(' ')}>
								<div className={styles.sendPrivateTitle}>SEND PRIVATELY</div>

								<div
									disabled={shouldDisableInput}
									className={this.getPrivatelyToggleButtonClasses()}
									onClick={event => this.onPrivateSendToggleClicked(event)}
									onKeyDown={event => this.onPrivateSendToggleClicked(event)}
								>
									<div className={styles.toggleButtonSwitcher} />
									<div className={styles.toggleButtonText}>
										{this.getPrivatelyToggleButtonText()}
									</div>
								</div>
							</div>
						</div>

						{/* Destination address */}
						<RoundedInput
							name="destination-address"
							title="DESTINATION ADDRESS"
							addon={destAddressAddon}
							disabled={shouldDisableInput}
							onInputChange={value => this.onDestAddressInputChanged(value)}
							ref={this.toAddressDomRef}
						/>

						{/* Amount */}
						<div className={styles.amountContainer}>
							<RoundedInput
								name="amount"
								title="AMOUNT"
								onlyNumberAllowed="true"
								addon={amountAddressAddon}
								disabled={shouldDisableInput}
								onInputChange={value => this.onAmountAddressInputChanged(value)}
								ref={this.amountAddressDomRef}
							/>
							<div className={styles.transactionFeeContainer}>
								<span className={styles.part1}>TRANSACTION FEE: </span>
								<span className={styles.part2}>0.0001</span>
								<span className={styles.part3}>RES</span>
							</div>
						</div>

						{/* Send button row */}
						<div className={[styles.sendButtonContainer, HLayout.hBoxContainer].join(' ')}>
							<button
								name="send-cash"
								disabled={this.props.sendCash.currentOperation && this.props.sendCash.currentOperation.operationId}
								onClick={event => this.onSendButtonClicked(event)}
								onKeyDown={event => this.onSendButtonClicked(event)}
							>
								SEND
							</button>
							<div className={[styles.desc, HLayout.hBoxContainer].join(' ')}>
								<div className={styles.descIcon}>
									<i className={this.getSendLockClasses()} />
								</div>
								<div className={styles.descContent}>{this.getSendTips()}</div>
							</div>
						</div>

						{/* Process row */}
						{this.renderProgressRow()}

						{/* Memo */}
						<div className={styles.memoConatiner}>
							<span className={styles.memoTitle}>Memo:</span>
							When sending cash from a Transparent (K1,JZ) address, the
							remaining balance is sent to another out-generated K1,JZ address.
							When sending from a Private (Z) address, the remaining unsent
							balance remains with the Z address. In both case the original
							sending address cannot be usef for sending again unit the
							transaction is confirmed. The address is temporarily remove from
							the list. Freshly mined coins may only be sent to a Private (Z)
							address.
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

export default connect(mapStateToProps, null)(SendCash)
