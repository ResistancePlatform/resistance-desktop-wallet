// @flow
import React, { Component } from 'react'
import classNames from 'classnames'
import { NavLink } from 'react-router-dom'
import * as Joi from 'joi'

import RoundedInput from '~/components/rounded-form/RoundedInput'
import RoundedTextArea from '~/components/rounded-form/RoundedTextArea'
import RoundedForm from '~/components/rounded-form/RoundedForm'

import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'
import styles from './GetStarted.scss'

const validationSchema = Joi.object().keys({
  walletName: Joi.string().required().label(`Wallet name`),
})

type Props = {
  // actions: object,
	// getStarted: GetStartedState
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
	render() {
		return (
      <div className={classNames(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <h1>Restore your wallet</h1>

        <RoundedForm
          id="get-started-restore-your-wallet-form"
          schema={validationSchema}
        >
          <RoundedInput name="walletName" label="Wallet name" />
          <RoundedTextArea name="mnemonicSeed" readOnly />

          <p>Wallet name</p>
          <p>Restore from seed</p>
          <p>Restore from keys</p>
          <p>Add your 25 (or 24) word mnemonic seed</p>
          <p>Restore height (optional)</p>
          <p>Your wallet is stored in</p>

          <NavLink to="/get-started">Prev</NavLink>
          <NavLink type="submit" role="button" to="/get-started/choose-password">Next</NavLink>
        </RoundedForm>
      </div>
    )
  }
}
