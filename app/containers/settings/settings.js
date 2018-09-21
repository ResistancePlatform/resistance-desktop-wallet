// @flow
import config from 'electron-settings'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { toastr } from 'react-redux-toastr'
import { translate } from 'react-i18next'
import cn from 'classnames'
import scrypt from 'scrypt-js'
import Iso6391 from 'iso-639-1'

import { availableLanguages } from '~/i18next.config'
import RoundedInput, { RoundedInputAddon } from '~/components/rounded-form/RoundedInput'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import styles from './settings.scss'
import HLayout from '~/theme/h-box-layout.scss'
import VLayout from '~/theme/v-box-layout.scss'

import { appStore } from '~/state/store/configureStore'
import { PopupMenuActions } from '~/state/reducers/popup-menu/popup-menu.reducer'
import { SystemInfoState } from '~/state/reducers/system-info/system-info.reducer'
import { SettingsActions, SettingsState } from '~/state/reducers/settings/settings.reducer'
import StatusModal from '~/components/settings/status-modal'

const generator = require('generate-password')

const languagePopupMenuId = 'settings-language-dropdown-id'

type Props = {
  t: any,
  systemInfo: SystemInfoState,
  settings: SettingsState,
  actions: SettingsActions,
  popupMenu: PopupMenuActions
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

	/**
	 * @memberof Settings
	 */
  getLanguageMenuItems() {
    const languages = Iso6391.getLanguages(availableLanguages)

    return languages.map(language => (
      <PopupMenuItem key={language.code} onClick={() => this.props.actions.updateLanguage(language.code)}>
        {language.nativeName}
      </PopupMenuItem>
    ))
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
	 * @returns
	 * @memberof Settings
	 */
	render() {
    const { t } = this.props

    const languageDropdownAddon: RoundedInputAddon = {
      enable: true,
      type: 'DROPDOWN',
      onClick: () => this.props.popupMenu.show(languagePopupMenuId)
    }

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

						{/* Language */}
            <div className={styles.languageContainer}>
              <RoundedInput
                name="language"
                defaultValue={Iso6391.getNativeName(this.props.settings.language)}
                label={t(`Language`)}
                addon={languageDropdownAddon}
                readOnly
              >
                {/* Dropdown menu container */}
                <PopupMenu id={languagePopupMenuId} relative>
                  {this.getLanguageMenuItems()}
                </PopupMenu>
              </RoundedInput>
            </div>

            <div className={cn(styles.sectionContainer, styles.walletPassword)}>
              <div className={styles.title}>{t(`Wallet password`)}</div>
              <div className={cn(styles.body)}>
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
              </div>
            </div>

						{/* Manage daemon */}
						<div className={styles.sectionContainer}>
							<div className={styles.title}>{t(`Manage daemon`)}</div>

							<div className={cn(styles.body, styles.buttonsRow)}>
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
						<div className={styles.sectionContainer}>
							<div className={styles.title}>{t(`Manage wallet`)}</div>

              <div className={cn(styles.body, styles.buttonsRow)}>
                <button
                  type="button"
                  className={styles.walletNodeButton}
                  onClick={this.props.actions.initiateWalletBackup}
                  onKeyDown={() => undefined}
                  disabled={this.props.settings.childProcessesStatus.NODE !== 'RUNNING'}
                >
                  {t(`Backup`)}
                </button>

                <button
                  type="button"
                  className={styles.walletNodeButton}
                  onClick={this.props.actions.initiateWalletRestore}
                  onKeyDown={() => undefined}
                  disabled={this.props.settings.childProcessesStatus.NODE !== 'RUNNING'}
                >
                  {t(`Restore`)}
                </button>
              </div>
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

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(SettingsActions, dispatch),
  popupMenu: bindActionCreators(PopupMenuActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('settings')(Settings))
