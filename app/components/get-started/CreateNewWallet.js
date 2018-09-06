// @flow
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import classNames from 'classnames'
import * as Joi from 'joi'

import { ResistanceService } from '~/service/resistance-service'
import RoundedInput, { RoundedInputAddon } from '~/components/rounded-form/RoundedInput'
import RoundedTextArea from '~/components/rounded-form/RoundedTextArea'
import RoundedForm from '~/components/rounded-form/RoundedForm'

import HLayout from '~/theme/h-box-layout.scss'
import VLayout from '~/theme/v-box-layout.scss'
import styles from './GetStarted.scss'

const resistance = new ResistanceService()

const validationSchema = Joi.object().keys({
  walletName: Joi.string().required().label(`Wallet name`),
})

type Props = {
  actions: Object,
	createNewWallet: Object
}


/**
 * @class CreateNewWallet
 * @extends {Component<Props>}
 */
export class CreateNewWallet extends Component<Props> {
	props: Props

	/**
   * Triggers child processes.
   *
	 * @returns
   * @memberof App
	 */
  componentDidMount() {
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
        <h1>Create a new wallet</h1>

        <p>Choose a name for your wallet</p>

        <RoundedForm id="getStartedCreateNewWallet" schema={validationSchema}>
          <RoundedInput name="walletName" label="Wallet name" />

          <RoundedTextArea
            name="mnemonicSeed"
            defaultValue={this.props.createNewWallet.wallet && this.props.createNewWallet.wallet.mnemonicSeed}
            readOnly
          />

          <p><strong>Note:</strong> This seed is very important to write down and keep secret. It&#39;s all you need to backup &amp; restore your wallet. </p>

          <p>The <strong>seed phrase</strong> can only be used to recover R- (transparent) addresses. In order to also back up and recover Z- (private) addresses, you will need to backup the wallet in Settings each time you create a new Z-address</p>

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
