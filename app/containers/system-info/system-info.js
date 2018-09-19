// @flow
import { EOL } from 'os'

import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux';
import { translate } from 'react-i18next'
import classNames from 'classnames'
import { toastr } from 'react-redux-toastr'

import RpcPolling from '~/components/rpc-polling/rpc-polling'
import { OSService } from '~/service/os-service'
import { SystemInfoActions, SystemInfoState } from '~/state/reducers/system-info/system-info.reducer'
import { appStore } from '~/state/store/configureStore'
import { State } from '~/state/reducers/types'
import OperationsModal from '~/components/system-info/OperationsModal'
import humanizeOperationName from '~/components/system-info/humanize-operation'

import styles from './system-info.scss'
import HLayout from '~/theme/h-box-layout.scss'

const osService = new OSService()

const daemonInfoPollingInterval = 2.0
const blockchainInfoPollingInterval = 4.0
const operationsPollingInterval = 3.0

type Props = {
  t: any,
  i18n: any,
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
   * Displays operation completion message
   *
	 * @param {*} prevProps
	 * @memberof SystemInfo
	 */
  componentDidUpdate(prevProps) {
    const { t } = this.props

    const prevOperationsMap = prevProps.systemInfo.operations.reduce((map, operation) => (
      {...map, [operation.id]: operation}
    ), {})

    const checkIfPending = (operation) => ['queued', 'executing'].includes(operation.status)

    this.props.systemInfo.operations.forEach(currentOperation => {
      const prevOperation = prevOperationsMap[currentOperation.id]

      if (prevOperation && !checkIfPending(prevOperation)) {
        return
      }

      if (!checkIfPending(currentOperation)) {
        appStore.dispatch(SystemInfoActions.operationFinished(currentOperation))
      }

      let description
      const operationName = humanizeOperationName(t, currentOperation)
      const successTitle = t(`{{operationName}} operation succeeded`, { operationName })

      switch (currentOperation.status) {
        case 'cancelled':
          toastr.info(t(`{{operationName}} operation cancelled successfully.`, { operationName }))
          break
        case 'failed':
          toastr.error(t(`{{operationName}} operation failed`, { operationName }), currentOperation.error && currentOperation.error.message)
          break
        case 'success':
          if (currentOperation.method === 'z_sendmany' && currentOperation.params && currentOperation.params.amounts) {
            const amount = currentOperation.params.amounts[0]
            description = t(
              `Sent {{amount}} RES from {{from}} to {{to}}.`,
              amount.amount, currentOperation.params.fromaddress, amount.address
            )
          }
          toastr.success(`${successTitle}${description ? '' : '.'}`, description)
          break
        default:
      }

    })
  }

  getChildProcessStatusName(t, processName) {
    const nameMap = {
      'RUNNING' : t(`Running`),
      'STARTING' : t(`Starting`),
      'RESTARTING' : t(`Restarting`),
      'FAILED' : t(`Failed`),
      'STOPPING' : t(`Stopping`),
      'MURDER FAILED' : t(`Murder failed`),
      'NOT RUNNING' : t(`Not running`)
    }
    const status = this.props.settings.childProcessesStatus[processName]
    return nameMap[status] || t(`Unknown`)
  }

	/**
	 * @memberof SystemInfo
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
    const { t } = this.props
    return osService.getOS() === 'windows' ? t(`Wallet in Explorer`) : t(`Wallet in Finder`)
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
    const { t, i18n } = this.props
    return tempDate ? moment().locale(i18n.language).calendar(tempDate) : t(`N/A`)
	}

  getMinerStatusIconTitle() {
    const { t } = this.props
    const minerStatus = this.props.settings.childProcessesStatus.MINER

    if (minerStatus !== 'RUNNING') {
      return `${t('Miner status:')} ${minerStatus}`
    }

    const minerInfo = this.props.systemInfo.miner

    const tooltip = [
      t(`Mining in progress...`),
      t(`Hashing power: {{hashingPower}} khash/s`, minerInfo.hashingPower),
      `${t('Mined blocks number:')} ${minerInfo.minedBlocksNumber}`
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
          role="none"
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
    const { t } = this.props

    if (!this.props.systemInfo.operations.length) {
      return t(`No pending operations.`)
    }

    const titleKey = `{{pendingCoun}} pending, {{successCount}} complete, {{failed}} failed operations.`

    return t(
      titleKey,
      this.getOperationsCount('queued', 'executing'),
      this.getOperationsCount('success'),
      this.getOperationsCount('failed')
    )
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
    const { t } = this.props

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
						<div className={styles.statusColoumnTitle}>{t(`Resistance status`)}</div>
						<div className={styles.statusColoumnValue}>
              <span className={styles.nodeStatusContainer}><i className={this.getLocalNodeStatusClassNames()} /><span>{t(this.getChildProcessStatusName(t, 'NODE'))}</span></span>
						</div>
					</div>

					{ /* Resistance status coloumn */}
					<div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>{t(`Synchronized`)}</div>
						<div className={styles.statusColoumnValue}>{this.props.systemInfo.blockchainInfo.blockchainSynchronizedPercentage}%</div>
					</div>

					{ /* Resistance status coloumn */}
					<div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>{t(`Up to`)}</div>
						<div className={styles.statusColoumnValue}>{this.displayLastBlockTime(this.props.systemInfo.blockchainInfo.lastBlockDate)}</div>
					</div>

					{ /* Resistance status coloumn */}
					{/* <div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>{t(`Resident`)}</div>
						<div className={styles.statusColoumnValue}>{this.props.resident}</div>
					</div> */}

					{ /* Resistance status coloumn */}
					<div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>{t(`Connections`)}</div>
						<div className={styles.statusColoumnValue}>{this.props.systemInfo.blockchainInfo.connectionCount}</div>
					</div>

				</div>

        <div className={styles.statusButtonsContainer}>
          {/* Buttons - don't add onKeyDown() handler, otherwise Finder will become active on Cmd-commands (like Cmd-Q) */}
          <button
            type="button"
            className={styles.walletInFileManagerButton}
            onClick={event => this.onWalletInFileManagerClicked(event)}
          >
            {this.getWalletInFileManagerLabel()}
          </button>

          <button
            type="button"
            className={styles.installationFolderButton}
            onClick={event => this.onInstallationFolderClicked(event)}
          >
            {t(`Installation folder`)}
          </button>
        </div>


        <div className={styles.statusCustomIconsContainer}>
          <i
            role="none"
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
            title={
              this.props.sendCash.isPrivateTransactions
                ? t(`Private transactions are enabled`)
                : t(`Private transactions are disabled`)
            }
          />
          <i
            className={classNames(styles.customIconTor, styles.statusIcon, { [styles.active]: this.props.settings.childProcessesStatus.TOR === 'RUNNING' })}
            title={t(`Tor status: {{status}}`, this.props.settings.childProcessesStatus.TOR)}
          />

          <OperationsModal />
        </div>

			</div>
		)
	}
}


const mapStateToProps = (state: State) => ({
	systemInfo: state.systemInfo,
	sendCash: state.sendCash,
	settings: state.settings
})

export default connect(mapStateToProps, null)(translate('other')(SystemInfo))
