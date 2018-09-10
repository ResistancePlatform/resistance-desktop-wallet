// @flow
import { userInfo } from 'os'
import React, { Component } from 'react'
import classNames from 'classnames'
import { NavLink } from 'react-router-dom'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import * as Joi from 'joi'

import { Bip39Service } from '~/service/bip39-service'
import { ResistanceService } from '~/service/resistance-service'
import RoundedInput, { RoundedInputAddon } from '~/components/rounded-form/RoundedInput'
import RoundedTextArea from '~/components/rounded-form/RoundedTextArea'
import RoundedForm from '~/components/rounded-form/RoundedForm'

import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'
import styles from './GetStarted.scss'

const resistance = new ResistanceService()
const bip39 = new Bip39Service()

type Props = {
  actions: object
}

type State = {
  isRestoringFromBackup: boolean
}

/**
 * @class RestoreYourWallet
 * @extends {Component<Props>}
 */
export class RestoreYourWallet extends Component<Props> {
	props: Props
  state: State

	/**
   * @memberof RestoreYourWallet
	 */
  constructor(props) {
    super(props)
    this.state = {
      isRestoringFromBackup: false
    }
  }

	/**
	 * @returns
   * @memberof RestoreYourWallet
	 */
  componentDidMount() {
    this.props.actions.setCreatingNewWallet(false)
  }

	/**
   * Joi's .xor() doesn't really work as expected, had to implement this. // @iwuvjhdva
   *
	 * @returns
   * @memberof RestoreYourWallet
	 */
  getValidationSchema() {
    const baseSchema = Joi.object().keys({
      walletName: Joi.string().required().label(`Wallet name`),
      restoreHeight: Joi.number().integer().optional().allow('').label(`Restore height`),
      walletPath: Joi.string().required().label(`Wallet path`)
    })

    if (this.state.isRestoringFromBackup) {
      return baseSchema.concat(Joi.object().keys({
        backupFile: Joi.string().required().label(`Backup file`)
      }))
    }

    const seedJoi = bip39.getMnemonicValidationJoi()

    return baseSchema.concat(Joi.object().keys({
      mnemonicSeed: seedJoi.mnemonicSeed().wordCount().valid().required().label(`Mnemonic seed`),
    }))
  }

	/**
	 * @returns
   * @memberof RestoreYourWallet
	 */
	render() {
		const backupFileAddon: RoundedInputAddon = {
			enable: true,
      type: 'CHOOSE_FILE',
      data: {
        title: `Restore Resistance wallet from a backup file`,
        filters: [{ name: `Wallet keys files`,  extensions: ['wallet'] }]
      }
		}

		return (
      <div className={classNames(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <div className={styles.title}>Restore your wallet</div>

        <RoundedForm
          id="getStartedRestoreYourWallet"
          options={{ stripUnknown: true }}
          schema={this.getValidationSchema()}
          important
        >
          <RoundedInput name="walletName" defaultValue={userInfo().username} label="Wallet name" />

          <Tabs
            className={styles.tabs}
            selectedTabClassName={styles.selectedTab}
            selectedTabPanelClassName={styles.selectedTabPanel}
            onSelect={tabIndex => this.setState({ isRestoringFromBackup: tabIndex === 1 })}
          >
            <TabList className={styles.tabList}>
              <Tab className={styles.tab}>Restore from seed</Tab>
              <Tab className={styles.tab}>Restore from backup</Tab>
            </TabList>

            <TabPanel>
              <RoundedTextArea name="mnemonicSeed" rows={8} label="Add your 25 (or 24) word mnemonic seed" />
            </TabPanel>

            <TabPanel>
              <RoundedInput name="backupFile" label="Backup file" addon={backupFileAddon} readOnly />
            </TabPanel>
          </Tabs>

          <RoundedInput name="restoreHeight" label="Restore height (optional)" number />

          <RoundedInput
            name="walletPath"
            label="Your wallet stored in"
            defaultValue={resistance.getWalletPath()}
            readOnly />

          <NavLink className={styles.prevLink} to="/get-started" />
          <NavLink className={styles.nextLink} type="submit" role="button" to="/get-started/choose-password" />

          <div className={styles.paginationDots}>
            <div className={styles.complete} />
            <div className={styles.empty} />
            <div className={styles.empty} />
          </div>

        </RoundedForm>
      </div>
    )
  }
}
