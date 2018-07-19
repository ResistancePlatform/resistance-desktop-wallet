// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux';
import RounedInput, { RoundedInputAddon } from '../../components/rounded-input'
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

	/**
	 * @memberof SendCash
	 */
	componentDidMount() {
	}

	/**
	 * @memberof SendCash
	 */
	componentWillUnmount() {
	}

	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

	getPrivatelyToggleButtonClasses() {
		return this.props.sendCash.isPrivateSendOn ? `${styles.toggleButton} ${styles.toggleButtonOn}` : `${styles.toggleButton}`
	}

	getPrivatelyToggleButtonText() {
		return this.props.sendCash.isPrivateSendOn ? `ON` : `OFF`
	}

	onPrivateSendToggleClicked(event) {
		this.eventConfirm(event)
		appStore.dispatch(SendCashActions.togglePrivateSend())
	}

	onFromAddressDropdownClicked(addonType) {
		console.log(`onFromAddressDropdownClicked: ${addonType}`)
	}

	onFromAddressInputChanged(value) {
		console.log(`onFromAddressInputChanged: ${value}`)
	}

	onDestAddressPasteClicked(addonType) {
		console.log(`onDestAddressPasteClicked: ${addonType}`)
	}

	onDestAddressInputChanged(value) {
		console.log(`onDestAddressInputChanged: ${value}`)
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
			onAddonClicked: this.onDestAddressPasteClicked
		}

		return (
			// Layout container
			<div className={[styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}>

				{ /* Route content */}
				<div className={[styles.sendCashContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>

					<div className={[HLayout.hBoxChild, VLayout.vBoxContainer, styles.wrapperContainer].join(' ')}>

						{ /* Title bar */}
						<div className={styles.titleBar}>Send Cash</div>

						{ /* Send from */}
						<div className={styles.sendFromContainer}>
							<div className={styles.sendFromTitle}>SEND FROM</div>

							<div className={styles.sendFromCheckboxContainer}>
								<span><input type="radio" name="sendFromType" checked />Transparent address</span>
								<span><input type="radio" name="sendFromType" />Private address</span>
							</div>
						</div>

						{ /* From address */}
						<div className={styles.fromAddressContainer}>
							<RounedInput
								name='from-address'
								title='FROM ADDRESS'
								addon={fromAddressAddon}
								onInputChange={(value) => this.onFromAddressInputChanged(value)}
							/>

							{ /* Toggle button */}
							<div className={styles.sendPrivatelyToggleContainer}>
								<div className={styles.sendPrivateTitle}>SEND PRIVATELY</div>

								<div
									className={this.getPrivatelyToggleButtonClasses()}
									onClick={(event) => this.onPrivateSendToggleClicked(event)}
									onKeyDown={(event) => this.onPrivateSendToggleClicked(event)}
								>
									<div className={styles.toggleButtonSwitcher} />
									<div className={styles.toggleButtonText} >{this.getPrivatelyToggleButtonText()}</div>
								</div>
							</div>
						</div>

						{ /* Destination address */}
						<RounedInput
							name='destination-address'
							title='DESTINATION ADDRESS'
							addon={destAddressAddon}
							onInputChange={(value) => this.onDestAddressInputChanged(value)}
						/>
					</div>
				</div>

			</div>
		)
	}
}


const mapStateToProps = (state) => ({
	sendCash: state.sendCash
})

export default connect(mapStateToProps, null)(SendCash);
