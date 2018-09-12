// @flow
import { userInfo } from 'os'
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import classNames from 'classnames'
import * as Joi from 'joi'

import { ResistanceService } from '~/service/resistance-service'
import RoundedInput from '~/components/rounded-form/RoundedInput'
import RoundedTextArea from '~/components/rounded-form/RoundedTextArea'
import RoundedForm from '~/components/rounded-form/RoundedForm'

import HLayout from '~/theme/h-box-layout.scss'
import VLayout from '~/theme/v-box-layout.scss'
import styles from './GetStarted.scss'

const resistance = new ResistanceService()

const validationSchema = Joi.object().keys({
  walletName: Joi.string().required().label(`Wallet name`),
  walletPath: Joi.string().required().label(`Wallet path`)
})

type Props = {
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
		return (
      <div className={classNames(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <div className={styles.title}>Create a new wallet</div>

        <div className={styles.hint}>Choose a name for your wallet</div>

        <RoundedForm id="getStartedCreateNewWallet" schema={validationSchema}>
          <RoundedInput name="walletName" label="Wallet name" defaultValue={userInfo().username} />

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
