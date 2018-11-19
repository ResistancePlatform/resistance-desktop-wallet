// @flow
import * as Joi from 'joi'
import config from 'electron-settings'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import Iso6391 from 'iso-639-1'

import { getPasswordValidationSchema } from '~/utils/auth'
import { availableLanguages } from '~/i18next.config'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import {
  RoundedForm,
  RoundedButton,
  ToggleButton,
  RoundedInput,
} from '~/components/rounded-form'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import styles from './settings.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'

import { PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'
import { SystemInfoState } from '~/reducers/system-info/system-info.reducer'
import { SettingsActions, SettingsState } from '~/reducers/settings/settings.reducer'
import StatusModal from '~/components/settings/status-modal'

const languagePopupMenuId = 'settings-language-dropdown-id'

type Props = {
  t: any,
  systemInfo: SystemInfoState,
  settings: SettingsState,
  actions: SettingsActions,
  popupMenu: PopupMenuActions
}

function getValidationSchema(t) {
  const schema = Joi.object().keys({
    oldPassword: Joi.string().required().label(t(`Old password`)),
    newPassword: getPasswordValidationSchema(),
    repeatPassword: (
      Joi.string().required().valid(Joi.ref('newPassword'))
      .label(t(`Repeat password`))
      .options({
        language: {
          any: {
            allowOnly: `!!${t('Passwords do not match')}`,
          }
        }
      })
    )
  })

  return schema
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
    return (
      this.getIsChildProcessUpdating('NODE')
      || this.getIsChildProcessUpdating('TOR')
      || this.checkPendingOperations()
    )
  }

  getStartStopLocalNodeButtonLabel() {
    const { t } = this.props
    const nodeStatus = this.props.settings.childProcessesStatus.NODE
    const startStatuses = ['NOT RUNNING', 'STARTING', 'FAILED']

    return startStatuses.indexOf(nodeStatus) !== -1
      ? t(`Start local node`)
      : t(`Stop local node`)
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
	 * @returns
	 * @memberof Settings
	 */
	render() {
    const { t } = this.props

		return (
			// Layout container
			<div className={cn(styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer)}>
				{/* Route content */}
				<div className={cn(styles.settingsContainer, VLayout.vBoxChild, HLayout.hBoxContainer)}>
					<div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, styles.wrapperContainer)}>
            <StatusModal />

						{/* Title bar */}
            <div className={styles.titleBar}>{t(`Settings`)}</div>

            <Tabs
              className={styles.tabs}
              selectedTabClassName={styles.selectedTab}
              selectedTabPanelClassName={styles.selectedTabPanel}
            >
              <TabList className={styles.tabList}>
                <Tab className={styles.tab}>{t(`Wallet password`)}</Tab>
                <Tab className={styles.tab}>{t(`Manage wallet`)}</Tab>
                <Tab className={styles.tab}>{t(`Manage daemons`)}</Tab>
                <Tab className={styles.tab}>{t(`Language`)}</Tab>
              </TabList>

              <TabPanel>


                {/* Wallet Password */}
                <div className={cn(styles.body)}>
                  <RoundedForm
                    id=""
                    schema={getValidationSchema(t)}
                  >

                    <RoundedInput
                      type="password"
                      name="oldPassword"
                      label={t(`Old password`)}
                    />

                    <RoundedInput
                      type="password"
                      name="newPassword"
                      label={t(`New password`)}
                    />

                    <RoundedInput
                      type="password"
                      name="repeatPassword"
                      label={t(`Repeat new password`)}
                    />

                    <RoundedButton
                      type="submit"
                      onClick={this.props.actions.savePassword}
                      disabled={this.getSavePasswordButtonDisabledAttribute()}
                    >
                      {t(`Save password`)}
                    </RoundedButton>

                  </RoundedForm>

                </div>

              </TabPanel>

              <TabPanel>
                {/* Manage wallet */}
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
                </TabPanel>

              <TabPanel>
                {/* Manage daemon */}

                <div className={styles.title}>{t(`Manage daemon`)}</div>

                <div className={cn(styles.body, styles.buttonsRow)}>
                  <RoundedButton
                    className={styles.stopLocalNodeButton}
                    onClick={this.props.actions.toggleLocalNode}
                    disabled={this.getIsChildProcessUpdating('NODE') || this.checkPendingOperations()}
                  >
                    {this.getStartStopLocalNodeButtonLabel()}
                  </RoundedButton>

                  <RoundedButton onClick={this.props.actions.openStatusModal}>
                    {t(`Show status`)}
                  </RoundedButton>

                  <ToggleButton
                    captions={[t(`Enable mining`)]}
                    defaultValue={this.props.settings.isMinerEnabled}
                    onChange={this.props.actions.toggleMiner}
                    disabled={this.getMiningDisabledAttribute()}
                  />

                  <ToggleButton
                    captions={[t(`Enable Tor`)]}
                    defaultValue={this.props.settings.isTorEnabled}
                    onChange={this.props.actions.toggleTor}
                    disabled={this.getTorDisabledAttribute()}
                  />

                </div>

              </TabPanel>

              <TabPanel>
                {/* Language */}
                <div className={styles.languageContainer}>
                  <PopupMenu id={languagePopupMenuId} relative>
                    {this.getLanguageMenuItems()}
                  </PopupMenu>

                  <RoundedInput
                    name="language"
                    defaultValue={Iso6391.getNativeName(this.props.settings.language)}
                    label={t(`Language`)}
                    readOnly
                  />
                </div>

              </TabPanel>

            </Tabs>

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
