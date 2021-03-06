// @flow
import os from 'os'
import * as Joi from 'joi'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import Iso6391 from 'iso-639-1'

import { getPasswordValidationSchema } from '~/utils/auth'
import {
  checkPendingOperations,
  getIsUpdating,
  getMiningDisabledAttribute,
  getTorDisabledAttribute,
} from '~/utils/child-process'
import { availableLanguages } from '~/i18next.config'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import {
  RoundedForm,
  RoundedButton,
  ToggleButton,
  RoundedInput,
  RoundedInputWithDropdown,
} from '~/components/rounded-form'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import styles from './settings.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'

import { PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'
import { SystemInfoState } from '~/reducers/system-info/system-info.reducer'
import { SettingsActions, SettingsState } from '~/reducers/settings/settings.reducer'

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

  getStartStopLocalNodeButtonLabel() {
    const { t } = this.props
    const nodeStatus = this.props.settings.childProcessesStatus.NODE
    const startStatuses = ['NOT RUNNING', 'STARTING', 'FAILED']

    return startStatuses.indexOf(nodeStatus) !== -1
      ? t(`Start local node`)
      : t(`Stop local node`)
  }

	/**
	 * @returns
	 * @memberof Settings
	 */
	render() {
    const { t } = this.props
    const { childProcessesStatus } = this.props.settings
    const totalCpuCoresNumber = os.cpus().length

		return (
			// Layout container
			<div className={cn(styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer)}>
				{/* Route content */}
				<div className={cn(styles.settingsContainer, VLayout.vBoxChild, HLayout.hBoxContainer)}>
					<div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, styles.wrapperContainer)}>
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
                    className={styles.form}
                    id="settingsSavePassword"
                    schema={getValidationSchema(t)}
                  >

                    <RoundedInput
                      type="password"
                      labelClassName={styles.inputLabel}
                      name="oldPassword"
                      label={t(`Old password`)}
                    />

                    <RoundedInput
                      type="password"
                      labelClassName={styles.inputLabel}
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
                      className={styles.savePasswordButton}
                      onClick={this.props.actions.savePassword}
                      important
                      spinner={this.props.settings.isSavingPassword}
                      disabled={this.props.settings.isSavingPassword}
                    >
                      {t(`Save password`)}
                    </RoundedButton>

                  </RoundedForm>

                </div>

              </TabPanel>

              <TabPanel>
                {/* Manage wallet */}
                <div className={styles.buttonsRow}>
                  <RoundedButton
                    onClick={this.props.actions.initiateWalletBackup}
                    disabled={this.props.settings.childProcessesStatus.NODE !== 'RUNNING'}
                    important
                  >
                    {t(`Backup`)}
                  </RoundedButton>

                  <RoundedButton
                    className={styles.walletNodeButton}
                    onClick={this.props.actions.initiateWalletRestore}
                    disabled={this.props.settings.childProcessesStatus.NODE !== 'RUNNING'}
                    important
                  >
                    {t(`Restore`)}
                  </RoundedButton>


                  <RoundedButton
                    onClick={this.props.actions.openWalletBackupsFolder}
                  >
                    {t(`Open Backups Folder`)}
                  </RoundedButton>

                </div>
                </TabPanel>

              <TabPanel>
                {/* Manage daemons */}

                <div className={cn(styles.localNodeButtons, styles.buttonsRow)}>
                  <RoundedButton
                    className={styles.stopLocalNodeButton}
                    onClick={this.props.actions.toggleLocalNode}
                    disabled={getIsUpdating(childProcessesStatus.NODE) || checkPendingOperations(this.props.systemInfo)}
                    important
                  >
                    {this.getStartStopLocalNodeButtonLabel()}
                  </RoundedButton>

                  <RoundedButton onClick={() => this.props.actions.openStatusModal()}>
                    {t(`Show status`)}
                  </RoundedButton>

                </div>

                <div className={styles.buttonsRow}>
                  <ToggleButton
                    defaultValue={this.props.settings.isMinerEnabled}
                    labelClassName={styles.toggleLabel}
                    label={t(`Enable mining`)}
                    onChange={this.props.actions.toggleMiner}
                    disabled={getMiningDisabledAttribute(childProcessesStatus)}
                  />

                 <RoundedInput
                   label={t(`Number of cores`)}
                   defaultValue={this.props.settings.cpuCoresNumber}
                   type="number"
                   onChange={value => this.props.actions.setCpuCoresNumber(parseInt(value, 10))}
                   min={1}
                   max={totalCpuCoresNumber}
                 />

                 <div className={styles.memo}>
                   <strong>{t(`Note:`)}</strong>&nbsp;
                   {t(`Changing amount of cores requires restarting of the mining daemon.`)}
                 </div>

                </div>

                <div className={styles.buttonsRow}>
                  <ToggleButton
                    defaultValue={this.props.settings.isTorEnabled}
                    label={t(`Enable Tor`)}
                    labelClassName={styles.toggleLabel}
                    onChange={this.props.actions.toggleTor}
                    disabled={getTorDisabledAttribute(childProcessesStatus, this.props.systemInfo)}
                  />

                 <div className={styles.memo}>
                   <strong>{t(`Note:`)}</strong>&nbsp;
                   {t(`With Tor enabled, users can achieve greater privacy by masking their IP addresses. This feature is currently in BETA phase.`)}
                 </div>

                </div>

              </TabPanel>

              <TabPanel>
                {/* Language */}
                <div className={styles.form}>

                  <RoundedInputWithDropdown
                    name="language"
                    defaultValue={Iso6391.getNativeName(this.props.settings.language)}
                    label={t(`Language`)}
                    onDropdownClick={() => this.props.popupMenu.show(languagePopupMenuId)}
                    readOnly
                  >
                    <PopupMenu id={languagePopupMenuId} relative>
                      {this.getLanguageMenuItems()}
                    </PopupMenu>

                  </RoundedInputWithDropdown>

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
