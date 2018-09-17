// @flow
import { userInfo } from 'os'
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import classNames from 'classnames'
import * as Joi from 'joi'

import { getWalletNameJoi } from '~/utils/get-started'
import { ResistanceService } from '~/service/resistance-service'
import RoundedInput from '~/components/rounded-form/RoundedInput'
import RoundedForm from '~/components/rounded-form/RoundedForm'

import HLayout from '~/theme/h-box-layout.scss'
import VLayout from '~/theme/v-box-layout.scss'
import styles from './GetStarted.scss'

const resistance = new ResistanceService()

const validationSchema = Joi.object().keys({
  walletName: getWalletNameJoi().walletName().fileDoesntExist(Joi.ref('walletPath')).required().label(`Wallet name`),
  walletPath: Joi.string().required().label(`Wallet path`)
})

type Props = {
  t: any,
  actions: object,
  getStartedActions: object,
	createNewWallet: object
}


/**
 * @class CreateNewWallet
 * @extends {Component<Props>}
 */
export class CreateNewWallet extends Component<Props> {
	props: Props

	/**
   * Triggers wallet generation.
   *
	 * @returns
   * @memberof App
	 */
  componentDidMount() {
    this.props.getStartedActions.setCreatingNewWallet(true)

    if (this.props.createNewWallet.wallet === null) {
      this.props.actions.generateWallet()
    }
  }

	/**
	 * @returns
   * @memberof CreateNewWallet
	 */
	render() {
    const { t } = this.props

		return (
      <div className={classNames(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <div className={styles.title}>{t(`Create a new wallet`)}</div>

        <div className={styles.hint}>{t(`Choose a name for your wallet`)}</div>

        <RoundedForm id="getStartedCreateNewWallet" schema={validationSchema}>
          <RoundedInput name="walletName" label="Wallet name" defaultValue={userInfo().username} />

          <RoundedInput
            name="walletPath"
            label={t(`Your wallet stored in`)}
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
