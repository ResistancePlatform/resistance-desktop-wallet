// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'

import RounedInput, { RoundedInputAddon } from '../../components/rounded-input'
import styles from './settings.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'

import { appStore } from '../../state/store/configureStore'
import { SystemInfoState } from '../../state/reducers/system-info/system-info.reducer'
import { SettingsActions, SettingsState } from '../../state/reducers/settings/settings.reducer'

const config = require('electron-settings')

type Props = {
	settings: SettingsState,
	systemInfo: SystemInfoState
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
	componentDidMount() { }

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

	getToggleButtonClasses(on) {
		return on ? `${styles.toggleButton} ${styles.toggleButtonOn}` : `${styles.toggleButton}`
	}

	getEnableMiningToggleButtonClasses() {
		return this.getToggleButtonClasses(this.props.settings.isMinerEnabled)
	}

	getEnableTorToggleButtonClasses() {
		return this.getToggleButtonClasses(this.props.settings.isTorEnabled)
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
		this.eventConfirm(event)
		console.log(`onSavePasswordClicked---->`)
	}

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	onStartStopLocalNodeClicked(event) {
		this.eventConfirm(event)

		switch (this.props.systemInfo.daemonInfo.status) {
			case 'RUNNING':
				return appStore.dispatch(SettingsActions.stopLocalNode())
			case 'NOT_RUNNING':
				return appStore.dispatch(SettingsActions.startLocalNode())
			default:
		}
	}

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	onEnableMiningToggleClicked(event) {
		this.eventConfirm(event)

		if (this.props.systemInfo.daemonInfo.status === 'RUNNING') {
			appStore.dispatch(SettingsActions.toggleEnableMiner())
		}
	}

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	onEnableTorToggleClicked(event) {
		this.eventConfirm(event)
		appStore.dispatch(SettingsActions.toggleEnableTor())
	}

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	onShowStatusClicked(event) {
		this.eventConfirm(event)
		console.log(`onShowStatusClicked---->`)
	}

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	onBackupWalletClicked(event) {
		this.eventConfirm(event)
		console.log(`onBackupWalletClicked---->`)
	}

  componentWillUpdate(nextProps) {
    if (nextProps.settings.isMinerEnabled !== this.props.settings.isMinerEnabled) {
      config.set('manageDaemon.enableMiner', nextProps.settings.isMinerEnabled)
    }
    if (nextProps.settings.isTorEnabled !== this.props.settings.isTorEnabled) {
      config.set('manageDaemon.enableTor', nextProps.isTorEnabled)
    }
  }

	/**
	 * @returns
	 * @memberof Settings
	 */
	render() {
		const passwordAddon: RoundedInputAddon = {
			enable: false,
			type: 'TEXT_PLACEHOLDER',
			onAddonClicked: () => { },
			value: ''
		}

		return (
			// Layout container
			<div className={[styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}>
				{/* Route content */}
				<div className={[styles.settingsContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
					<div className={[HLayout.hBoxChild, VLayout.vBoxContainer, styles.wrapperContainer].join(' ')}>
						{/* Title bar */}
						<div className={styles.titleBar}>Settings</div>

						{/* Old password */}
						<RounedInput
							name="old-password"
							title="OLD PASSWORD"
							addon={passwordAddon}
							onInputChange={value => this.onOldPasswordInputChanged(value)}
						/>

						{/* New password */}
						<RounedInput
							name="new-password"
							title="NEW PASSWORD"
							addon={passwordAddon}
							onInputChange={value => this.onNewPasswordInputChanged(value)}
						/>

						{/* Repeat password */}
						<RounedInput
							name="repeat-password"
							title="REPEAT NEW PASSWORD"
							addon={passwordAddon}
							onInputChange={value => this.onRepeatPasswordInputChanged(value)}
						/>

						{/* Save password */}
						<button
							className={styles.savePasswordButton}
							onClick={event => this.onSavePasswordClicked(event)}
							onKeyDown={event => this.onSavePasswordClicked(event)}
						>
							SAVE PASSWORD
						</button>

						{/* Manage daemon */}
						<div className={styles.manageDaemonContainer}>
							<div className={styles.manageDaemonTitle}>MANAGE DAEMON</div>

							<div className={styles.manageDaemonBody}>
								{/* disabled={this.props.settings.isDaemonUpdating} */}
								<button
									className={styles.stopLocalNodeButton}
									onClick={event => this.onStartStopLocalNodeClicked(event)}
									onKeyDown={event => this.onStartStopLocalNodeClicked(event)}
								>
									{this.props.systemInfo.daemonInfo.status === 'RUNNING' ? 'STOP LOCAL NODE' : 'START LOCAL NODE'}
								</button>

								<button
									className={styles.showStatusButton}
									onClick={event => this.onShowStatusClicked(event)}
									onKeyDown={event => this.onShowStatusClicked(event)}
									disabled
								>
									SHOW STATUS
								</button>

								{/* Enable Mining toggle */}
								<div className={styles.toggleButtonContainer}>
									<div className={styles.toggleButtonContainerTitle}>
										Enable Mining
									</div>

									{/* disabled={this.props.settings.isMinerUpdating} */}
									<div
										className={this.getEnableMiningToggleButtonClasses()}
										onClick={event => this.onEnableMiningToggleClicked(event)}
										onKeyDown={event => this.onEnableMiningToggleClicked(event)}
									>
										<div className={styles.toggleButtonSwitcher} />
										<div className={styles.toggleButtonText}>
											{this.props.settings.isMinerEnabled ? 'On' : 'Off'}
										</div>
									</div>
								</div>

								{/* Enable Tor toggle */}
								{/* disabled={this.props.settings.isTorUpdating} */}
								<div className={styles.toggleButtonContainer} style={{ paddingLeft: '5rem' }}>
									<div className={styles.toggleButtonContainerTitle}>
										Enable Tor
									</div>
									<div
										title="Local node restart is required"
										className={this.getEnableTorToggleButtonClasses()}
										onClick={event => this.onEnableTorToggleClicked(event)}
										onKeyDown={event => this.onEnableTorToggleClicked(event)}
									>
										<div className={styles.toggleButtonSwitcher} />
										<div className={styles.toggleButtonText}>
											{this.props.settings.isTorEnabled ? 'On' : 'Off'}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Manage wallet */}
						<div className={styles.manageWalletContainer}>
							<div className={styles.manageWalletTitle}>MANAGE WALLET</div>

							<button
								className={styles.backupWalletNodeButton}
								onClick={event => this.onBackupWalletClicked(event)}
								onKeyDown={event => this.onBackupWalletClicked(event)}
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

const mapStateToProps = state => ({
	settings: state.settings,
	systemInfo: state.systemInfo,
	sendCash: state.sendCash
})

export default connect(mapStateToProps, null)(Settings)
