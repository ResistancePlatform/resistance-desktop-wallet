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
import StatusModal from '../../components/settings/status-modal'

const config = require('electron-settings')

type Props = {
  systemInfo: SystemInfoState,
	settings: SettingsState
}

/**
 * @class Settings
 * @extends {Component<Props>}
 */
class Settings extends Component<Props> {
	props: Props

	/**
	 * @param {*} nextProps
	 * @memberof Settings
	 */
  componentWillUpdate(nextProps) {
    if (nextProps.settings.isMinerEnabled !== this.props.settings.isMinerEnabled) {
      config.set('manageDaemon.enableMiner', nextProps.settings.isMinerEnabled)
    }
    if (nextProps.settings.isTorEnabled !== this.props.settings.isTorEnabled) {
      config.set('manageDaemon.enableTor', nextProps.settings.isTorEnabled)
    }
  }

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

  getIsChildProcessUpdating(processName) {
    const processStatus = this.props.settings.childProcessesStatus[processName]
    const updateStatuses = ['STARTING', 'STOPPING', 'RESTARTING']
    return updateStatuses.indexOf(processStatus) !== -1
  }

  getMiningDisabledAttribute() {
    const isLocalNodeOffline = this.props.settings.childProcessesStatus.NODE !== 'RUNNING'
    return isLocalNodeOffline || this.getIsChildProcessUpdating('MINER')
  }

  getTorDisabledAttribute() {
    return this.getIsChildProcessUpdating('NODE') || this.getIsChildProcessUpdating('TOR') || this.checkPendingOperations()
  }

  getStartStopLocalNodeButtonLabel() {
    const nodeStatus = this.props.settings.childProcessesStatus.NODE
    const startStatuses = ['NOT RUNNING', 'STARTING', 'FAILED']
    return startStatuses.indexOf(nodeStatus) !== -1 ? 'Start Local Node' : 'Stop Local Node'
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

		switch (this.props.settings.childProcessesStatus.NODE) {
			case 'RUNNING':
			case 'MURDER FAILED':
				return appStore.dispatch(SettingsActions.stopLocalNode())
			case 'NOT RUNNING':
			case 'FAILED':
				return appStore.dispatch(SettingsActions.startLocalNode())
			default:
		}
	}

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
  checkPendingOperations() {
    if (this.props.systemInfo.isNewOperationTriggered) {
      return true
    }

    const result = this.props.systemInfo.operations.some(operation => (
      ['queued', 'executing'].indexOf(operation.status) !== -1
    ))

    return result
  }

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	onEnableMiningToggleClicked(event) {
		this.eventConfirm(event)
    const action = this.props.settings.isMinerEnabled
      ? SettingsActions.disableMiner()
      : SettingsActions.enableMiner()
      appStore.dispatch(action)
	}

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	onEnableTorToggleClicked(event) {
		this.eventConfirm(event)
    const action = this.props.settings.isTorEnabled
      ? SettingsActions.disableTor()
      : SettingsActions.enableTor()
		appStore.dispatch(action)
	}

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	onShowStatusClicked(event) {
		this.eventConfirm(event)
		appStore.dispatch(SettingsActions.openStatusModal())
	}

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	onBackupWalletClicked(event) {
		this.eventConfirm(event)
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
			onAddonClicked: () => { },
			value: ''
		}

		return (
			// Layout container
			<div className={[styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}>
				{/* Route content */}
				<div className={[styles.settingsContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>
					<div className={[HLayout.hBoxChild, VLayout.vBoxContainer, styles.wrapperContainer].join(' ')}>
            <StatusModal />

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
								<button
									className={styles.stopLocalNodeButton}
									onClick={event => this.onStartStopLocalNodeClicked(event)}
									onKeyDown={event => this.onStartStopLocalNodeClicked(event)}
                  disabled={this.getIsChildProcessUpdating('NODE') || this.checkPendingOperations()}
								>
                  {this.getStartStopLocalNodeButtonLabel()}
								</button>

								<button
									className={styles.showStatusButton}
									onClick={event => this.onShowStatusClicked(event)}
									onKeyDown={event => this.onShowStatusClicked(event)}
								>
									SHOW STATUS
								</button>

								{/* Enable Mining toggle */}
								<div className={styles.toggleButtonContainer}>
									<div className={styles.toggleButtonContainerTitle}>
										Enable Mining
									</div>

									<div
										className={this.getEnableMiningToggleButtonClasses()}
										onClick={event => this.onEnableMiningToggleClicked(event)}
										onKeyDown={event => this.onEnableMiningToggleClicked(event)}
                    disabled={this.getMiningDisabledAttribute()}
									>
										<div className={styles.toggleButtonSwitcher} />
										<div className={styles.toggleButtonText}>
											{this.props.settings.isMinerEnabled ? 'On' : 'Off'}
										</div>
									</div>
								</div>

								{/* Enable Tor toggle */}
								<div className={styles.toggleButtonContainer} style={{ paddingLeft: '5rem' }}>
									<div className={styles.toggleButtonContainerTitle}>
										Enable Tor
									</div>
									<div
										title="Local node restart is required"
										className={this.getEnableTorToggleButtonClasses()}
										onClick={event => this.onEnableTorToggleClicked(event)}
										onKeyDown={event => this.onEnableTorToggleClicked(event)}
                    disabled={this.getTorDisabledAttribute()}
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
  systemInfo: state.systemInfo,
	settings: state.settings
})

export default connect(mapStateToProps, null)(Settings)
