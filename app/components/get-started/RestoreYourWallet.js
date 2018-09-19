// @flow
import { userInfo } from 'os'
import React, { Component } from 'react'
import classNames from 'classnames'
import { NavLink } from 'react-router-dom'
import * as Joi from 'joi'

import { getWalletNameJoi } from '~/utils/get-started'
import { ResistanceService } from '~/service/resistance-service'
import RoundedInput, { RoundedInputAddon } from '~/components/rounded-form/RoundedInput'
import RoundedForm from '~/components/rounded-form/RoundedForm'

import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'
import styles from './GetStarted.scss'

const resistance = new ResistanceService()

const validationSchema = Joi.object().keys({
  walletName: getWalletNameJoi().walletName().fileDoesntExist(Joi.ref('walletPath')).required().label(`Wallet name`),
  backupFile: Joi.string().required().label(`Backup file`),
  restoreHeight: Joi.number().integer().optional().allow('').label(`Restore height`),
  walletPath: Joi.string().required().label(`Wallet path`)
})

type Props = {
  t: any,
  actions: object
}

/**
 * @class RestoreYourWallet
 * @extends {Component<Props>}
 */
export class RestoreYourWallet extends Component<Props> {
	props: Props

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
    const { t } = this.props

		const backupFileAddon: RoundedInputAddon = {
			enable: true,
      type: 'CHOOSE_FILE',
      data: {
        title: t(`Restore Resistance wallet from a backup file`),
        filters: [{ name: t(`Wallet keys files`),  extensions: ['wallet'] }]
      }
		}

		return (
      <div className={classNames(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <div className={styles.title}>{t(`Restore your wallet`)}</div>

        <RoundedForm
          id="getStartedRestoreYourWallet"
          options={{ stripUnknown: true }}
          schema={validationSchema}
        >
          <RoundedInput name="walletName" defaultValue={userInfo().username} label={t(`Wallet name`)} />

          <RoundedInput name="backupFile" label={t(`Backup file`)} addon={backupFileAddon} readOnly />

          <RoundedInput name="restoreHeight" label={t(`Restore height (optional)`)} number />

          <RoundedInput
            name="walletPath"
            label={t(`Your wallet stored in`)}
            defaultValue={resistance.getWalletPath()}
            readOnly />

          <NavLink className={styles.prevLink} to="/get-started/get-started" />
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
