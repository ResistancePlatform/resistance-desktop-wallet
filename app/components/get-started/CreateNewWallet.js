// @flow
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import classNames from 'classnames'

import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'
import styles from './GetStarted.scss'

type Props = {
  actions: Object,
	getStarted: GetStartedState
}


/**
 * @class CreateNewWallet
 * @extends {Component<Props>}
 */
export class CreateNewWallet extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof CreateNewWallet
	 */
	render() {
		return (
      <div className={classNames(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <h1>Create a new wallet</h1>

        <p>Choose a name for your wallet</p>

        <p>Wallet name</p>

        <p>Note: This seed is very important to write down and keep secret. It&#39;s all you need to backup &amp; restore your wallet. </p>

        <p>Your wallet stored in</p>

        <div>
          <NavLink to="/get-started/choose-password">Next</NavLink>
        </div>
      </div>
    )
  }
}
