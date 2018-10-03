// @flow
import { remote } from 'electron'
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import cn from 'classnames'
import Iso6391 from 'iso-639-1'

import { i18n } from '~/i18next.config'
import FetchParametersState from '~/reducers/fetch-parameters/fetch-parameters.reducer'
import { ResistanceService } from '~/service/resistance-service'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './Welcome.scss'

const resistance = new ResistanceService()

type Props = {
  t: any,
  roundedForm: object,
  getStarted: object,
  fetchParameters: FetchParametersState,
  welcome: object,
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
    const { t } = this.props

    // <div className={cn(styles.hint, styles[this.props.welcome.status])}>
    //  {this.props.welcome.hint || t(`Check the wallet configuration before applying`)}
    // </div>

		return (
      <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <div className={styles.title}>{t(`Welcome to Resistance!`)}</div>

        <div className={styles.downloadProgressContainer}>
         <div className={styles.downloadProgress}>
            {t(`Please wait for Resistance parameters download to complete`)}
            <div style={{ width: `${68}%` }}>
              {t(`Please wait for Resistance parameters download to complete`)}
            </div>
          </div>

        </div>

        <div className={cn(styles.innerContainer, styles.summary)}>
          <div className={styles.title}>
            {t(`Here's a summary of your new wallet configuration`)}:
          </div>

          <ul className={styles.body}>
            <li>
              <span>{t(`Language`)}:</span> {Iso6391.getNativeName(i18n.language)}
            </li>
            <li>
              <span>{t(`Wallet name`)}:</span> {this.getWalletName()}
            </li>
            <li>
              <span>{t(`Wallet path`)}:</span> {resistance.getWalletPath()}
            </li>
            <li>
              <span>{t(`Daemon address`)}:</span> {this.getDaemonAddress()}
            </li>
            <li>
              <span>{t(`Network type`)}:</span> {this.getNetworkType()}
            </li>
          </ul>

        </div>

        <div className={styles.buttons}>
          {!this.props.welcome.isReadyToUse &&
            <button
              type="button"
              onClick={this.props.actions.applyConfiguration}
              onKeyDown={this.props.actions.applyConfiguration}
              disabled={!this.props.fetchParameters.isDownloadComplete || this.props.welcome.isBootstrapping}
            >
              {t(`Apply configuration`)}
            </button>
          }

          {this.props.welcome.isReadyToUse &&
            <button
              type="button"
              onClick={this.props.actions.useResistance}
              onKeyDown={this.props.actions.useResistance}
            >
              {t(`Use Resistance`)}
            </button>
          }
        </div>

        {!this.props.welcome.isReadyToUse && !this.props.welcome.isBootstrapping &&
        <NavLink className={styles.prevLink} to="/get-started/choose-password" />
        }
      </div>
    )
  }
}
