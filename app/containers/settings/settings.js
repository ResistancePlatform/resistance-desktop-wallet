// @flow
import config from 'electron-settings'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toastr } from 'react-redux-toastr'
import { translate } from 'react-i18next'
import { remote } from 'electron'
import scrypt from 'scrypt-js'

import RoundedInput, { RoundedInputAddon } from '~/components/rounded-form/RoundedInput'
import styles from './settings.scss'
import HLayout from '~/theme/h-box-layout.scss'
import VLayout from '~/theme/v-box-layout.scss'

import { appStore } from '~/state/store/configureStore'
import { SystemInfoState } from '~/state/reducers/system-info/system-info.reducer'
import { SettingsActions, SettingsState } from '~/state/reducers/settings/settings.reducer'
import StatusModal from '~/components/settings/status-modal'

const generator = require('generate-password')

type Props = {
  t: any,
  systemInfo: SystemInfoState,
	settings: SettingsState
}

type State = {
  oldPassword: string,
  newPassword: string,
  repeatPassword: string,
  isPasswordUpdating: boolean
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
    const { t } = this.props
    const nodeStatus = this.props.settings.childProcessesStatus.NODE
    const startStatuses = ['NOT RUNNING', 'STARTING', 'FAILED']
    return startStatuses.indexOf(nodeStatus) !== -1 ? t(`Start local node`) : t(`Stop local node`)
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
	async onSavePasswordClicked(t) {
    const passwordHash = config.get('password.hash')

    if (passwordHash) {
      const oldPasswordHash = await this.generatePasswordHash(t, this.state.oldPassword, config.get('password.salt', ''))

      if (!oldPasswordHash) {
        return false
      }

      if (oldPasswordHash.toString() !== passwordHash.toString()) {
        toastr.error(t(`Old password doesn't match.`))
        return false
      }
    }

    const newSalt = generator.generate({ length: 32, numbers: true })
    const newPasswordHash = await this.generatePasswordHash(t, this.state.newPassword, newSalt)

    if (!newPasswordHash) {
      return false
    }

    config.set('password', {
      hash: newPasswordHash,
      salt: newSalt
    })

    this.setState({ oldPassword: '' })
    toastr.success(t(`Password saved successfully.`))

    return false
	}

  generatePasswordHash(t, password: string, salt: string) {
    this.setState({ isPasswordUpdating: true })

    const promise = new Promise(resolve => {
      scrypt(Buffer.from(password), Buffer.from(salt), 16384, 8, 1, 64, (error, progress, key) => {
        if (error) {
          toastr.error(t(`Password hash generation failed`), error.toString())
          resolve(null)
        } else if (key) {
          resolve(key)
        }
      })
    })

    return promise
  }

  getSavePasswordButtonDisabledAttribute() {
    const passwordHash = config.get('password.hash')

    if (this.state.isPasswordUpdating) {
      return true
    }

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
	onBackupWalletClicked() {
    const { t } = this.props

    const onSaveHandler = (filePath) => {
      if (filePath) {
        appStore.dispatch(SettingsActions.exportWallet(filePath))
      }
    }

    const title = t(`Backup Resistance wallet to a file`)

    remote.dialog.showSaveDialog({
      title,
      defaultPath: remote.app.getPath('documents'),
      message: title,
      nameFieldLabel: t(`File name:`),
      filters: [{ name: t(`Text files`),  extensions: ['wallet'] }]
    }, onSaveHandler)

    return false
	}

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	onRestoreWalletClicked(t) {
    const onOpenHandler = (filePaths) => {
      if (filePaths && filePaths.length) {
        appStore.dispatch(SettingsActions.importWallet(filePaths.pop()))
      }
    }

    const title = t(`Restore Resistance wallet from a file`)
    remote.dialog.showOpenDialog({
      title,
      defaultPath: remote.app.getPath('documents'),
      message: title,
      filters: [{ name: t(`Text files`),  extensions: ['wallet'] }]
    }, onOpenHandler)

    return false
	}

	/**
	 * @returns
	 * @memberof Settings
	 */
	render() {
    const { t } = this.props

		const passwordAddon: RoundedInputAddon = {
			enable: false,
			type: 'TEXT_PLACEHOLDER',
			onClick: () => { },
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
						<div className={styles.titleBar}>{t(`Settings`)}</div>

						{/* Old password */}
						<RoundedInput
							name="old-password"
              defaultValue={this.state.oldPassword}
							label={t(`Old password`)}
							addon={passwordAddon}
							onChange={value => this.onOldPasswordInputChanged(value)}
              password
						/>

						{/* New password */}
						<RoundedInput
							name="new-password"
							label={t(`New password`)}
							addon={passwordAddon}
              value={this.state.newPassword}
							onChange={value => this.onNewPasswordInputChanged(value)}
              password
						/>

						{/* Repeat password */}
						<RoundedInput
							name="repeat-password"
							label={t(`Repeat new password`)}
							addon={passwordAddon}
              value={this.state.repeatPassword}
							onChange={value => this.onRepeatPasswordInputChanged(value)}
              password
						/>

						{/* Save password */}
						<button
              type="button"
							className={styles.savePasswordButton}
              onClick={async () => this.onSavePasswordClicked(t)}
							onKeyDown={async () => this.onSavePasswordClicked(t)}
              disabled={this.getSavePasswordButtonDisabledAttribute()}
						>
              {t(`Save password`)}
						</button>

						{/* Manage daemon */}
						<div className={styles.manageDaemonContainer}>
							<div className={styles.manageDaemonTitle}>{t(`Manage daemon`)}</div>

							<div className={styles.manageDaemonBody}>
								<button
                  type="button"
									className={styles.stopLocalNodeButton}
									onClick={event => this.onStartStopLocalNodeClicked(event)}
									onKeyDown={event => this.onStartStopLocalNodeClicked(event)}
                  disabled={this.getIsChildProcessUpdating('NODE') || this.checkPendingOperations()}
								>
                  {this.getStartStopLocalNodeButtonLabel()}
								</button>

								<button
                  type="button"
									className={styles.showStatusButton}
									onClick={event => this.onShowStatusClicked(event)}
									onKeyDown={event => this.onShowStatusClicked(event)}
								>
                  {t(`Show status`)}
								</button>

								{/* Enable Mining toggle */}
								<div className={styles.toggleButtonContainer}>
									<div className={styles.toggleButtonContainerTitle}>
                    {t(`Enable mining`)}
									</div>

									<div
                    role="button"
										className={this.getEnableMiningToggleButtonClasses()}
										onClick={event => this.onEnableMiningToggleClicked(event)}
										onKeyDown={event => this.onEnableMiningToggleClicked(event)}
                    disabled={this.getMiningDisabledAttribute()}
									>
										<div className={styles.toggleButtonSwitcher} />
										<div className={styles.toggleButtonText}>
											{this.props.settings.isMinerEnabled ? t(`On`) : t(`Off`)}
										</div>
									</div>
								</div>

								{/* Enable Tor toggle */}
								<div className={styles.toggleButtonContainer} style={{ paddingLeft: '5rem' }}>
									<div className={styles.toggleButtonContainerTitle}>
                    {t(`Enable Tor`)}
									</div>
									<div
                    role="button"
										title={t(`Local node restart is required`)}
										className={this.getEnableTorToggleButtonClasses()}
										onClick={event => this.onEnableTorToggleClicked(event)}
										onKeyDown={event => this.onEnableTorToggleClicked(event)}
                    disabled={this.getTorDisabledAttribute()}
									>
										<div className={styles.toggleButtonSwitcher} />
										<div className={styles.toggleButtonText}>
											{this.props.settings.isTorEnabled ? t(`On`) : t(`Off`)}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Manage wallet */}
						<div className={styles.manageWalletContainer}>
							<div className={styles.manageWalletTitle}>{t(`Manage wallet`)}</div>

							<button
                type="button"
								className={styles.walletNodeButton}
								onClick={event => this.onBackupWalletClicked(event)}
								onKeyDown={event => this.onBackupWalletClicked(event)}
                disabled={this.props.settings.childProcessesStatus.NODE !== 'RUNNING'}
							>
                {t(`Backup wallet`)}
							</button>

							<button
                type="button"
								className={styles.walletNodeButton}
								onClick={() => this.onRestoreWalletClicked(t)}
								onKeyDown={() => this.onRestoreWalletClicked(t)}
                disabled={this.props.settings.childProcessesStatus.NODE !== 'RUNNING'}
							>
                {t(`Restore wallet`)}
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

export default connect(mapStateToProps, null)(translate('settings')(Settings))
