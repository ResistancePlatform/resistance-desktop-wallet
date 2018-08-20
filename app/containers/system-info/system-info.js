// @flow
import { EOL } from 'os'

import React, { Component } from 'react'
import { connect } from 'react-redux';
import classNames from 'classnames'

import RpcPolling from '../../components/rpc-polling/rpc-polling'
import { OSService } from '../../service/os-service'
import { SystemInfoActions, SystemInfoState } from '../../state/reducers/system-info/system-info.reducer'
import { appStore } from '../../state/store/configureStore'
import { AppState } from '../../state/reducers/appState'
import OperationsModal from '../../components/system-info/operations-modal'

import styles from './system-info.scss'
import HLayout from '../../theme/h-box-layout.scss'

const osService = new OSService()

const daemonInfoPollingInterval = 2.0
const blockchainInfoPollingInterval = 4.0
const operationsPollingInterval = 3.0

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
	 * @memberof Settings
	 */
  getLocalNodeStatusClassNames() {
    // TODO: Replace with ChildProcessStatusIcon component
    const processStatus = this.props.settings.childProcessesStatus.NODE
    const statusClassNames = [styles.nodeStatusIcon]

    if (processStatus === 'RUNNING' || processStatus === 'STARTING') {
      statusClassNames.push('icon-status-running')
    } else {
      statusClassNames.push('icon-status-stop')
    }

    const color = osService.getChildProcessStatusColor(processStatus)

    if (color) {
      statusClassNames.push(styles[color])
    }

    return statusClassNames.join(' ')
  }

  getWalletInFileManagerLabel() {
    return osService.getOS() === 'windows' ? 'Wallet in Explorer' : 'Wallet in Finder';
  }

  onWalletInFileManagerClicked() {
    appStore.dispatch(SystemInfoActions.openWalletInFileManager())
    return false
  }

  onInstallationFolderClicked() {
    appStore.dispatch(SystemInfoActions.openInstallationFolder())
    return false
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

  getOperationsCount(...args) {
    const operationsCount = this.props.systemInfo.operations.reduce((counter, operation) => (
      counter + (args.indexOf(operation.status) === -1 ? 0 : 1)
    ), 0)
    return operationsCount
  }

  getOperationIconHint() {
    let iconHint
    const pendingNumber = this.getOperationsCount('queued', 'executing')

    if (pendingNumber) {
      iconHint = (
        <span
          className={styles.operationsIconHint}
          title={this.getOperationsIconTitle()}
          onClick={e => this.onOperationsIconClicked(e)}
          onKeyDown={e => this.onOperationsIconClicked(e)}
        >
          {pendingNumber}
        </span>
      )
    }
    return iconHint
  }

  getOperationsIconTitle() {
    if (!this.props.systemInfo.operations.length) {
      return 'No pending operations.'
    }

    let failed = ''
    const failedNumber = this.getOperationsCount('failed')

    if (failedNumber) {
      failed = `, ${failedNumber}`
    }

    return `${this.getOperationsCount('queued', 'executing')} pending, ${this.getOperationsCount('success')} complete${failed} operations.`
  }

  onOperationsIconClicked() {
    appStore.dispatch(SystemInfoActions.openOperationsModal())
    return false
  }

	/**
	 * @returns
	 * @memberof SystemInfo
	 */
	render() {
		return (
			<div className={[styles.systemInfoContainer, HLayout.hBoxContainer].join(' ')}>
        <RpcPolling
          interval={daemonInfoPollingInterval}
          actions={{
            polling: SystemInfoActions.getDaemonInfo,
            success: SystemInfoActions.gotDaemonInfo,
            failure: SystemInfoActions.getDaemonInfoFailure
          }}
        />

        <RpcPolling
          interval={blockchainInfoPollingInterval}
          actions={{
            polling: SystemInfoActions.getBlockchainInfo,
            success: SystemInfoActions.gotBlockchainInfo,
            failure: SystemInfoActions.getBlockchainInfoFailure
          }}
        />

        <RpcPolling
          interval={operationsPollingInterval}
          actions={{
            polling: SystemInfoActions.getOperations,
            success: SystemInfoActions.gotOperations,
            failure: SystemInfoActions.getOperationsFailure
          }}
        />

				{ /* Status column container */}
				<div className={[styles.statusContainer, HLayout.hBoxChild].join(' ')}>

					{ /* Resistance status coloumn */}
					<div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>RESISTANCE STATUS</div>
						<div className={styles.statusColoumnValue}>
              <span className={styles.nodeStatusContainer}><i className={this.getLocalNodeStatusClassNames()} /><span>{this.props.settings.childProcessesStatus.NODE}</span></span>
						</div>
					</div>

					{ /* Resistance status coloumn */}
					<div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>SYNCHRONIZED</div>
						<div className={styles.statusColoumnValue}>{this.props.systemInfo.blockchainInfo.blockchainSynchronizedPercentage}%</div>
					</div>

					{ /* Resistance status coloumn */}
					<div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>UP TO</div>
						<div className={styles.statusColoumnValue}>{this.displayLastBlockTime(this.props.systemInfo.blockchainInfo.lastBlockDate)}</div>
					</div>

					{ /* Resistance status coloumn */}
					{/* <div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>RESIDENT</div>
						<div className={styles.statusColoumnValue}>{this.props.resident}</div>
					</div> */}

					{ /* Resistance status coloumn */}
					<div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>CONNECTIONS</div>
						<div className={styles.statusColoumnValue}>{this.props.systemInfo.blockchainInfo.connectionCount}</div>
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
            className={classNames(styles.customIconOperations, styles.statusIcon, { [styles.active]: this.props.systemInfo.operations.length })}
            title={this.getOperationsIconTitle()}
            onClick={e => this.onOperationsIconClicked(e)}
            onKeyDown={e => this.onOperationsIconClicked(e)}
          />
          {this.getOperationIconHint()}

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

          <OperationsModal />
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
