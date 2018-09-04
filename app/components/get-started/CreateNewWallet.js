// @flow
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import classNames from 'classnames'
import * as Joi from 'joi'

import RoundedInput, { RoundedInputAddon } from '../../components/rounded-form/RoundedInput'
import RoundedTextArea from '../../components/rounded-form/RoundedTextArea'
import RoundedForm from '../../components/rounded-form/RoundedForm'

import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'
import styles from './GetStarted.scss'

const validationSchema = Joi.object().keys({
  walletName: Joi.string().required().label(`Wallet name`),
})

type Props = {
  actions: Object,
	createNewWallet: GetStartedState.createNewWallet
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
    this.props.actions.generateWallet()
  }

	/**
	 * @returns
   * @memberof CreateNewWallet
	 */
	render() {
		const nameAddon: RoundedInputAddon = {
			enable: false,
			type: 'TEXT_PLACEHOLDER',
			onAddonClicked: () => { },
			value: ''
		}

		return (
      <div className={classNames(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <h1>Create a new wallet</h1>

        <p>Choose a name for your wallet</p>

        <RoundedForm
          schema={validationSchema}
          fields={this.props.createNewWallet.fields}
          onValidate={this.props.actions.updateValidationErrors}
        >
          <RoundedInput
            name="wallet-name"
            defaultValue={this.props.createNewWallet.fields.walletName}
            label="Wallet name"
            addon={nameAddon}
            error={this.props.createNewWallet.validationErrors.name}
            onChange={value => this.props.actions.updateField('walletName', value)}
          />

          <RoundedTextArea
            name="mnemonic-seed"
            defaultValue={this.props.createNewWallet.mnemonicSeed}
            readOnly
          />

        <button
          type="submit"
          className={styles.nextButton}
          onClick={this.props.actions.navigateToChoosePasswordPage}
          onKeyDown={() => {}}
        >Next
        </button>

          <p><strong>Note:</strong> This seed is very important to write down and keep secret. It&#39;s all you need to backup &amp; restore your wallet. </p>

          <p>The <strong>seed phrase</strong> can only be used to recover R- (transparent) addresses. In order to also back up and recover Z- (private) addresses, you will need to backup the wallet in Settings each time you create a new Z-address</p>

          <RoundedInput
            name="wallet-path"
            defaultValue="/usr/local/"
            label="Your wallet stored in"
            addon={nameAddon}
          />
        </RoundedForm>

        <div>
          <NavLink to="/get-started/choose-password">Next</NavLink>
        </div>
      </div>
    )
  }
}
