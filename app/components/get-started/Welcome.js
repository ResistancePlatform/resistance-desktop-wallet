// @flow
import React, { Component } from 'react'
import classNames from 'classnames'

import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'
import styles from './GetStarted.scss'

type Props = {
  actions: Object,
	getStarted: GetStartedState
}


/**
 * @class Welcome
 * @extends {Component<Props>}
 */
export class Welcome extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof Welcome
	 */
	render() {
		return (
      <div className={classNames(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <h1>Welcome to Resistance!</h1>

        Success! Your wallet has been created
        Here&#39;s a summary of your new wallet configuration:

        <ul>
          <li>Language:</li>
          <li>Wallet name:</li>
          <li>Backup seed:</li>
          <li>Wallet path:</li>
          <li>Daemon address:</li>
          <li>Network type:</li>
        </ul>

        <button
          onClick={this.props.actions.useResistance}
          onKeyDown={this.props.actions.useResistance}
        >
          Use Resistance
        </button>
      </div>
    )
  }
}
