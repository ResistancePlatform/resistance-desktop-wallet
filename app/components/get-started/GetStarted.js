// @flow
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import classNames from 'classnames'

import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'
import styles from './GetStarted.scss'

type Props = {
}


/**
 * @class GetStarted
 * @extends {Component<Props>}
 */
export class GetStarted extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof GetStarted
	 */
	render() {
		return (
      <div className={classNames(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <div className={styles.title}>Get started with Resistance</div>

        <div className={styles.hint}>Please select one of the following options:</div>

        <NavLink className={styles.chooseFlowLink} to="/get-started/create-new-wallet">
          <i />
          Create a new wallet
        </NavLink>

        <NavLink className={styles.chooseFlowLink} to="/get-started/restore-your-wallet">
          <i />
          Restore wallet from keys or mnemonic seed
        </NavLink>
      </div>
    )
  }
}
