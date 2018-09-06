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
        <h1>Get started with Resistance</h1>

        Please select one of the following options:

        <div>
          <NavLink to="/get-started/create-new-wallet">Create a new wallet</NavLink>
        </div>

        <div>
          <NavLink to="/get-started/restore-your-wallet">Restore wallet from keys or mnemonic seed</NavLink>
        </div>
      </div>
    )
  }
}
