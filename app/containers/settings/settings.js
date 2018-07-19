// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux';
import RounedInput, { RoundedInputAddon } from '../../components/rounded-input'
// import { SendCashActions, SendCashState } from '../../state/reducers/send-cash/send-cash.reducer'
// import { appStore } from '../../state/store/configureStore'
import styles from './settings.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'


type Props = {
	// sendCash: SendCashState
}


/**
 * @class Settings
 * @extends {Component<Props>}
 */
class Settings extends Component<Props> {
	props: Props

	/**
	 * @memberof Settings
	 */
	componentDidMount() {
	}


	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

	/**
	 * @param {*} value
	 * @memberof Settings
	 */
	onOldPasswordInputChanged(value) {
		console.log(`onOldPasswordInputChanged: ${value}`)
	}

	/**
	 * @param {*} value
	 * @memberof Settings
	 */
	onNewPasswordInputChanged(value) {
		console.log(`onNewPasswordInputChanged: ${value}`)
	}

	/**
	 * @param {*} value
	 * @memberof Settings
	 */
	onRepeatPasswordInputChanged(value) {
		console.log(`onRepeatPasswordInputChanged: ${value}`)
	}

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	onSavePasswordClicked(event) {
		this.eventConfirm(event);
		console.log(`onSavePasswordClicked---->`)
	}

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	onStopLocalNodeClicked(event) {
		this.eventConfirm(event);
		console.log(`onStopLocalNodeClicked---->`)
	}

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	onShowStatusClicked(event) {
		this.eventConfirm(event);
		console.log(`onShowStatusClicked---->`)
	}

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	onBackupWalletClicked(event) {
		this.eventConfirm(event);
		console.log(`onBackupWalletClicked---->`)
	}


	/**
	 * @returns
	 * @memberof Settings
	 */
	render() {
		const passwordAddon: RoundedInputAddon = {
			enable: false,
			type: 'TEXT_PLACEHOLDER',
			onAddonClicked: null,
			value: ''
		}

		return (
			// Layout container
			<div className={[styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}>

				{ /* Route content */}
				<div className={[styles.settingsContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>

					<div className={[HLayout.hBoxChild, VLayout.vBoxContainer, styles.wrapperContainer].join(' ')}>

						{ /* Title bar */}
						<div className={styles.titleBar}>Send Cash</div>

						{ /* Old password */}
						<RounedInput
							name='old-password'
							title='OLD PASSWORD'
							addon={passwordAddon}
							onInputChange={(value) => this.onOldPasswordInputChanged(value)}
						/>

						{ /* New password */}
						<RounedInput
							name='new-password'
							title='NEW PASSWORD'
							addon={passwordAddon}
							onInputChange={(value) => this.onNewPasswordInputChanged(value)}
						/>

						{ /* Repeat password */}
						<RounedInput
							name='repeat-password'
							title='REPEAT NEW PASSWORD'
							addon={passwordAddon}
							onInputChange={(value) => this.onRepeatPasswordInputChanged(value)}
						/>

						{ /* Save password */}
						<button
							className={styles.savePasswordButton}
							onClick={(event) => this.onSavePasswordClicked(event)}
							onKeyDown={(event) => this.onSavePasswordClicked(event)}
						>
							SAVE PASSWORD
						</button>

						{ /* Manage daemon */}
						<div className={styles.manageDaemonContainer} >
							<div className={styles.manageDaemonTitle}>MANAGE DAEMON</div>

							<button
								className={styles.stopLocalNodeButton}
								onClick={(event) => this.onStopLocalNodeClicked(event)}
								onKeyDown={(event) => this.onStopLocalNodeClicked(event)}
							>
								STOP LOCAL NODE
							</button>

							<button
								className={styles.showStatusButton}
								onClick={(event) => this.onShowStatusClicked(event)}
								onKeyDown={(event) => this.onShowStatusClicked(event)}
							>
								SHOW STATUS
							</button>
						</div>

						{ /* Manage wallet */}
						<div className={styles.manageWalletContainer} >
							<div className={styles.manageWalletTitle}>MANAGE WALLET</div>

							<button
								className={styles.backupWalletNodeButton}
								onClick={(event) => this.onBackupWalletClicked(event)}
								onKeyDown={(event) => this.onBackupWalletClicked(event)}
							>
								BACKUP WALLET
							</button>
						</div>

					</div>

				</div>

			</div>
		)
	}
}


const mapStateToProps = (state) => ({
	sendCash: state.sendCash
})

export default connect(mapStateToProps, null)(Settings);
