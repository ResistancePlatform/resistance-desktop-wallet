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

        <p>Wallet name</p>
        <p>Restore from seed</p>
        <p>Restore from keys</p>
        <p>Add your 25 (or 24) word mnemonic seed</p>
        <p>Restore height (optional)</p>
        <p>Your wallet is stored in</p>

        <div>
          <NavLink to="/get-started/welcome">Next</NavLink>
        </div>
      </div>
    )
  }
}
