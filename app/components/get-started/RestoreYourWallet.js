// @flow
import { userInfo } from 'os'
import React, { Component } from 'react'
import classNames from 'classnames'
import { NavLink } from 'react-router-dom'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import * as Joi from 'joi'

import { ResistanceService } from '~/service/resistance-service'
import RoundedInput, { RoundedInputAddon } from '~/components/rounded-form/RoundedInput'
import RoundedTextArea from '~/components/rounded-form/RoundedTextArea'
import RoundedForm from '~/components/rounded-form/RoundedForm'

import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'
import styles from './GetStarted.scss'

const resistance = new ResistanceService()

/* Joi's .xor() doesn't really work as expected, had to implement this // @iwuvjhdva */
const getValidationSchema = (isRestoringFromBackup: boolean) => {
  const baseSchema = Joi.object().keys({
    walletName: Joi.string().required().label(`Wallet name`),
    restoreHeight: Joi.number().integer().optional().allow('').label(`Restore height`),
    walletPath: Joi.string().required().label(`Wallet path`)
  })

  if (isRestoringFromBackup) {
    return baseSchema.concat(Joi.object().keys({
      backupFile: Joi.string().required().label(`Backup file`)
    }))
  }

  return baseSchema.concat(Joi.object().keys({
    mnemonicSeed: Joi.string().required().label(`Mnemonic seed`),
  }))
}

type Props = {
  actions: object
}

type State = {
  selectedTabIndex: number
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
      selectedTabIndex: 0
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
        <h1>Restore your wallet</h1>

        <RoundedForm
          id="getStartedRestoreYourWalletForm"
          options={{ stripUnknown: true }}
          schema={getValidationSchema(this.state.selectedTabIndex === 1)}
        >
          <RoundedInput name="walletName" defaultValue={userInfo().username} label="Wallet name" />

          <p>Wallet name</p>

          <Tabs
            className={styles.tabs}
            selectedTabClassName={styles.selectedTab}
            selectedTabPanelClassName={styles.selectedTabPanel}
            onSelect={(selectedTabIndex) => this.setState({ selectedTabIndex })}
          >
            <TabList className={styles.tabList}>
              <Tab className={styles.tab}>Restore from seed</Tab>
              <Tab className={styles.tab}>Restore from backup</Tab>
            </TabList>

            <TabPanel>
              <RoundedTextArea name="mnemonicSeed" label="Add your 25 (or 24) word mnemonic seed" />
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

          <NavLink to="/get-started">Prev</NavLink>
          <NavLink type="submit" role="button" to="/get-started/choose-password">Next</NavLink>
        </RoundedForm>
      </div>
    )
  }
}
