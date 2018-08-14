// @flow
import { EOL } from 'os'

import React, { Component } from 'react'
import { connect } from 'react-redux';
import classNames from 'classnames'

import { OSService } from '../../service/os-service'
import { SystemInfoActions, SystemInfoState } from '../../state/reducers/system-info/system-info.reducer'
import { appStore } from '../../state/store/configureStore'
import { AppState } from '../../state/reducers/appState'

import styles from './system-info.scss'
import HLayout from '../../theme/h-box-layout.scss'

const osService = new OSService()

type Props = {
	systemInfo: SystemInfoState,
	sendCash: SendCashState,
	settings: SettingsState
}

/**
 * @class SystemInfo
 * @extends {Component<Props>}
 */
class SystemInfo extends Component<Props> {
	props: Props

	/**
	 * @memberof SystemInfo
	 */
	componentDidMount() {
		appStore.dispatch(SystemInfoActions.startGettingDaemonInfo())
		appStore.dispatch(SystemInfoActions.startGettingBlockchainInfo())
	}

	/**
	 * @param {*} event
	 * @memberof Settings
	 */
	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

  getWalletInFileManagerLabel() {
    return osService.getOS() === 'windows' ? 'Wallet in Explorer' : 'Wallet in Finder';
  }

  onWalletInFileManagerClicked(event) {
    this.eventConfirm(event)
    appStore.dispatch(SystemInfoActions.openWalletInFileManager())
  }

  onInstallationFolderClicked(event) {
    this.eventConfirm(event)
    appStore.dispatch(SystemInfoActions.openInstallationFolder())
  }

	displayLastBlockTime(tempDate: Date | null) {
		if (tempDate === undefined || tempDate === null || tempDate === false) {
			return 'N/A'
		}

		const nowDate = new Date()
		let tempDateTimeStr = ''
		if (tempDate.toLocaleDateString() === nowDate.toLocaleDateString()) {
			tempDateTimeStr = `Today, ${tempDate.toLocaleTimeString()}`
		} else {
			tempDateTimeStr = tempDate.toLocaleString()
		}

		return tempDateTimeStr.substring(0, tempDateTimeStr.length - 3)
	}

  getMinerStatusIconTitle() {
    const minerStatus = this.props.settings.childProcessesStatus.MINER

    if (minerStatus !== 'RUNNING') {
      return `Miner status: ${minerStatus}`
    }

    const minerInfo = this.props.systemInfo.miner

    const tooltip = [
      `Mining in progress...`,
      `Hashing power: ${minerInfo.hashingPower} khash/s`,
      `Mined blocks number: ${minerInfo.minedBlocksNumber}`
    ].join(EOL)

    return tooltip
  }

	/**
	 * @returns
	 * @memberof SystemInfo
	 */
	render() {
		return (
			<div className={[styles.systemInfoContainer, HLayout.hBoxContainer].join(' ')}>
				{ /* Status column container */}
				<div className={[styles.statusContainer, HLayout.hBoxChild].join(' ')}>

					{ /* Resistance status coloumn */}
					<div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>RESISTANCE STATUS</div>
						<div className={styles.statusColoumnValue}>
							{this.props.systemInfo.daemonInfo.status === 'RUNNING' ?
								<span><i className={['icon-status-running', styles.daemonIsRunning].join(' ')} /><span>Running</span></span> :
								<span><i className={['icon-status-stop', styles.daemonIsNotRunning].join(' ')} /><span>NOT RUNNING</span></span>
							}
						</div>
					</div>

					{ /* Resistance status coloumn */}
					<div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>SYNCHRONIZED</div>
						<div className={styles.statusColoumnValue}>{this.props.systemInfo.blockChainInfo.blockchainSynchronizedPercentage}%</div>
					</div>

					{ /* Resistance status coloumn */}
					<div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>UP TO</div>
						<div className={styles.statusColoumnValue}>{this.displayLastBlockTime(this.props.systemInfo.blockChainInfo.lastBlockDate)}</div>
					</div>

					{ /* Resistance status coloumn */}
					{/* <div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>RESIDENT</div>
						<div className={styles.statusColoumnValue}>{this.props.resident}</div>
					</div> */}

					{ /* Resistance status coloumn */}
					<div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>CONNECTIONS</div>
						<div className={styles.statusColoumnValue}>{this.props.systemInfo.blockChainInfo.connectionCount}</div>
					</div>

				</div>

        <div className={styles.statusButtonsContainer}>
          {/* Buttons - don't add onKeyDown() handler, otherwise Finder will become active on Cmd-commands (like Cmd-Q) */}
          <button
            className={styles.walletInFileManagerButton}
            onClick={event => this.onWalletInFileManagerClicked(event)}
          >
            {this.getWalletInFileManagerLabel()}
          </button>

          <button
            className={styles.installationFolderButton}
            onClick={event => this.onInstallationFolderClicked(event)}
          >
            Installation Folder
          </button>
        </div>


        <div className={styles.statusCustomIconsContainer}>
          <i
            className={classNames(styles.customIconMining, styles.statusIcon, { [styles.active]: this.props.settings.childProcessesStatus.MINER === 'RUNNING' })}
            title={this.getMinerStatusIconTitle()}
          />
          <i
            className={classNames(styles.customIconPrivacy, styles.statusIcon, { [styles.active]: this.props.sendCash.isPrivateTransactions })}
            title={`Private transactions are ${this.props.sendCash.isPrivateTransactions ? 'enabled' : 'disabled'}.`}
          />
          <i
            className={classNames(styles.customIconTor, styles.statusIcon, { [styles.active]: this.props.settings.childProcessesStatus.TOR === 'RUNNING' })}
            title={`Tor status: ${this.props.settings.childProcessesStatus.TOR}`}
          />
        </div>

			</div>
		)
	}
}


const mapStateToProps = (state: AppState) => ({
	systemInfo: state.systemInfo,
	sendCash: state.sendCash,
	settings: state.settings
})

export default connect(mapStateToProps, null)(SystemInfo);
