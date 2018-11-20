// @flow
import { remote } from 'electron'
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import cn from 'classnames'
import Iso6391 from 'iso-639-1'

import { i18n } from '~/i18next.config'
import FetchParametersProgressText from '~/components/fetch-parameters/FetchParametersProgressText'
import FetchParametersState from '~/reducers/fetch-parameters/fetch-parameters.reducer'
import { ResistanceService } from '~/service/resistance-service'
import { RoundedButton } from '~/components/rounded-form'

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
   * Triggers child processes and binds Resistance parameters download event handlers.
   *
	 * @returns
   * @memberof App
	 */
  componentDidMount() {
    const { t } = this.props
    this.props.actions.displayHint(t(`Check the wallet configuration before applying`))
  }
	/**
   *
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

    const isApplyConfigurationDisabled = (!this.props.fetchParameters.isDownloadComplete ||
                                          this.props.welcome.isBootstrapping)

		return (
      <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <div className={styles.title}>{t(`Welcome to Resistance!`)}</div>

        {this.props.fetchParameters.isDownloadComplete
          ? (
            <div className={cn(styles.hint, styles[this.props.welcome.status])}>
              {this.props.welcome.hint}
            </div>
          ) : (<FetchParametersProgressText />)
        }

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
            <RoundedButton
              className={styles.applyConfiguration}
              onClick={this.props.actions.applyConfiguration}
              spinner={isApplyConfigurationDisabled}
              disabled={isApplyConfigurationDisabled}
              important
            >
              {t(`Apply configuration`)}
            </RoundedButton>
          }

          {this.props.welcome.isReadyToUse &&
            <RoundedButton onClick={this.props.actions.useResistance} important>
              {t(`Use Resistance`)}
            </RoundedButton>
          }
        </div>

        {!this.props.welcome.isReadyToUse && !this.props.welcome.isBootstrapping &&
        <NavLink className={styles.prevLink} to="/get-started/choose-password" />
        }
      </div>
    )
  }
}
