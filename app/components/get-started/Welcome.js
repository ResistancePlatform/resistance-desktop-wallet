// @flow
import { remote } from 'electron'
import React, { Component } from 'react'
import classNames from 'classnames'

import { ResistanceService } from '~/service/resistance-service'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'
import styles from './GetStarted.scss'

const resistance = new ResistanceService()

type Props = {
  roundedForm: object,
  getStarted: object,
  actions: object
}


/**
 * @class Welcome
 * @extends {Component<Props>}
 */
export class Welcome extends Component<Props> {
	props: Props
  nodeConfig: object

  constructor(props) {
    super(props)
    this.nodeConfig = remote.getGlobal('resistanceNodeConfig')
  }

	/**
   * Gets wallet name.
   *
   * @returns string
   * @memberof Welcome
	 */
  getWalletName(): string {
    let form

    if (this.props.getStarted.isCreatingNewWallet) {
      form = this.props.roundedForm.getStartedCreateNewWallet
    } else {
      form = this.props.roundedForm.getStartedRestoreYourWallet
    }

    return form && form.fields.walletName || ''
  }

	/**
   * Gets daemon address, i.e. localhost:18233
   *
   * @returns string
   * @memberof Welcome
	 */
  getDaemonAddress(): string {
    const port = this.nodeConfig.rpcport || '18233'
    return `localhost:${port}`
  }

	/**
   * Gets network type, i.e. Mainnet, Testnet or Regtest
   *
   * @returns string
   * @memberof Welcome
	 */
  getNetworkType(): string {
    if (this.nodeConfig.testnet) {
      return `Testnet`
    }

    if (this.nodeConfig.regtest) {
      return `Regtest`
    }

    return `Mainnet`
  }

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
          <li>Language: English</li>
          <li>Wallet name: {this.getWalletName()}</li>
          <li>Backup seed: *******</li>
          <li>Wallet path: {resistance.getWalletPath()}</li>
          <li>Daemon address: {this.getDaemonAddress()}</li>
          <li>Network type: {this.getNetworkType()}</li>
        </ul>

        <button
          type="button"
          onClick={this.props.actions.useResistance}
          onKeyDown={this.props.actions.useResistance}
        >
          Use Resistance
        </button>
      </div>
    )
  }
}
