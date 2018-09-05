// @flow
import React, { Component } from 'react'
import classNames from 'classnames'
import { NavLink } from 'react-router-dom'

import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'
import styles from './GetStarted.scss'

type Props = {
  actions: Object,
	getStarted: GetStartedState
}


/**
 * @class ChoosePassword
 * @extends {Component<Props>}
 */
export class ChoosePassword extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof ChoosePassword
	 */
	render() {
		return (
      <div className={classNames(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <h1>Choose password for your wallet</h1>

        <p>Enter a strong password (using letters, numbers and/or symbols)</p>
        <p>Password</p>
        <p>Confirm password</p>
        <p>Note: If you loose or forget this password, it cannot be recovered. Your wallet can only be restored from it&#39;s 25 word mnemonic seed.</p>
        <p>Password strength</p>

        <div>
          <NavLink to="/get-started/create-new-wallet">Prev</NavLink>
          <NavLink to="/get-started/welcome">Next</NavLink>
        </div>
      </div>
    )
  }
}

