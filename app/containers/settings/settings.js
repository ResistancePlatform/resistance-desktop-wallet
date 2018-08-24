// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toastr } from 'react-redux-toastr'

import RoundedInput, { RoundedInputAddon } from '../../components/rounded-input'
import styles from './settings.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'

import { appStore } from '../../state/store/configureStore'
import { SystemInfoState } from '../../state/reducers/system-info/system-info.reducer'
import { SettingsActions, SettingsState } from '../../state/reducers/settings/settings.reducer'
import StatusModal from '../../components/settings/status-modal'

const config = require('electron-settings')
const generator = require('generate-password')
const argon2 = require('argon2-browser')

type Props = {
  systemInfo: SystemInfoState,
	settings: SettingsState
}

type State = {
  oldPassword: string,
  newPassword: string,
  repeatPassword: string
}

/**
 * @class Settings
 * @extends {Component<Props>}
 */
class Settings extends Component<Props> {
	props: Props
  state: State

	/**
	 * @memberof Settings
	 */
  constructor(props) {
    super(props)
    this.state = {}
  }

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
    this.setState({ oldPassword: value })
	}

	/**
	 * @param {*} value
	 * @memberof Settings
	 */
	onNewPasswordInputChanged(value) {
    this.setState({ newPassword: value })
	}

	/**
	 * @param {*} value
	 * @memberof Settings
	 */
	onRepeatPasswordInputChanged(value) {
    this.setState({ repeatPassword: value })
	}

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	async onSavePasswordClicked() {
    const passwordHash = config.get('password.hash')

    if (passwordHash) {
      const oldPasswordHash = await this.generatePasswordHash(this.state.oldPassword, config.get('password.salt', ''))

      if (!oldPasswordHash) {
        return false
      }

      if (oldPasswordHash !== passwordHash) {
        toastr.error(`Old password doesn't match.`)
        return false
      }
    }

    const newSalt = generator.generate({ length: 32, numbers: true })
    const newPasswordHash = await this.generatePasswordHash(this.state.newPassword, newSalt)

    if (!newPasswordHash) {
      return false
    }

    config.set('password', {
      hash: newPasswordHash,
      salt: newSalt
    })

    this.setState({ oldPassword: null })
    toastr.success(`Password saved successfully.`)

    return false
	}

  async generatePasswordHash(password: string, salt: string) {
    let hash

    try {
      hash = await argon2.hash({
        pass: password,
        salt
      })
    } catch (err) {
      toastr.error(`Password hash generation failed`, err.toString())
      return null
    }

    return hash.hashHex
  }

  getSavePasswordButtonDisabledAttribute() {
    const passwordHash = config.get('passwordHash')

    if (passwordHash && !this.state.oldPassword) {
      return true
    }

    if (!this.state.newPassword) {
      return true
    }

    if (this.state.newPassword !== this.state.repeatPassword) {
      return true
    }

    return false
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
						<RoundedInput
							name="old-password"
							label="Old Password"
							addon={passwordAddon}
							onChange={value => this.onOldPasswordInputChanged(value)}
              password
						/>

						{/* New password */}
						<RoundedInput
							name="new-password"
							label="New Password"
							addon={passwordAddon}
              value={this.state.newPassword}
							onChange={value => this.onNewPasswordInputChanged(value)}
              password
						/>

						{/* Repeat password */}
						<RoundedInput
							name="repeat-password"
							label="Repeat New Password"
							addon={passwordAddon}
              value={this.state.repeatPassword}
							onChange={value => this.onRepeatPasswordInputChanged(value)}
              password
						/>

						{/* Save password */}
						<button
							className={styles.savePasswordButton}
              onClick={async () => this.onSavePasswordClicked()}
							onKeyDown={async () => this.onSavePasswordClicked()}
              disabled={this.getSavePasswordButtonDisabledAttribute()}
						>
							Save Password
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
