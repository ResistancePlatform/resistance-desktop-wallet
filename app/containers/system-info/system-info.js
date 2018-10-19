// @flow
import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux';
import { translate } from 'react-i18next'
import cn from 'classnames'
import { toastr } from 'react-redux-toastr'

import RpcPolling from '~/components/rpc-polling/rpc-polling'
import { getOS } from '~/utils/os'
import { ChildProcessService } from '~/service/child-process-service'
import { ResDexAssetsActions } from '~/reducers/resdex/assets/reducer'
import { SystemInfoActions, SystemInfoState } from '~/reducers/system-info/system-info.reducer'
import { getStore } from '~/store/configureStore'
import { State } from '~/reducers/types'
import humanizeOperationName from '~/components/system-info/humanize-operation'

import styles from './system-info.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'

const childProcess = new ChildProcessService()

const daemonInfoPollingInterval = 2.0
const blockchainInfoPollingInterval = 4.0
const operationsPollingInterval = 3.0

type Props = {
  t: any,
  i18n: any,
	systemInfo: SystemInfoState,
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
        getStore().dispatch(SystemInfoActions.operationFinished(currentOperation))
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
              {
                amount: amount.amount,
                from: currentOperation.params.fromaddress,
                to: amount.address
              }
            )
          }
          toastr.success(`${successTitle}${description ? '' : '.'}`, description)
          break
        default:
      }

    })
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

    const color = childProcess.getChildProcessStatusColor(processStatus)

    if (color) {
      statusClassNames.push(styles[color])
    }

    return statusClassNames.join(' ')
  }

  getWalletInFileManagerLabel() {
    const { t } = this.props
    return getOS() === 'windows' ? t(`Wallet in Explorer`) : t(`Wallet in Finder`)
  }

  onWalletInFileManagerClicked() {
    getStore().dispatch(SystemInfoActions.openWalletInFileManager())
    return false
  }

  onInstallationFolderClicked() {
    getStore().dispatch(SystemInfoActions.openInstallationFolder())
    return false
  }

	displayLastBlockTime(tempDate: Date | null) {
    const { t, i18n } = this.props
    return tempDate ? moment().locale(i18n.language).calendar(tempDate) : t(`N/A`)
	}

	/**
	 * @returns
	 * @memberof SystemInfo
	 */
	render() {
    const { t } = this.props

		return (
			<div className={cn(styles.systemInfoContainer, HLayout.hBoxContainer)}>
        <RpcPolling
          criticalChildProcess="NODE"
          interval={daemonInfoPollingInterval}
          actions={{
            polling: SystemInfoActions.getDaemonInfo,
            success: SystemInfoActions.gotDaemonInfo,
            failure: SystemInfoActions.getDaemonInfoFailure
          }}
        />

        <RpcPolling
          interval={blockchainInfoPollingInterval}
          criticalChildProcess="NODE"
          actions={{
            polling: SystemInfoActions.getBlockchainInfo,
            success: SystemInfoActions.gotBlockchainInfo,
            failure: SystemInfoActions.getBlockchainInfoFailure
          }}
        />

        <RpcPolling
          interval={operationsPollingInterval}
          criticalChildProcess="NODE"
          actions={{
            polling: SystemInfoActions.getOperations,
            success: SystemInfoActions.gotOperations,
            failure: SystemInfoActions.getOperationsFailure
          }}
        />

        <RpcPolling
          interval={10.0 * 60 * 60}
          actions={{
            polling: ResDexAssetsActions.getCurrencyHistory,
            success: ResDexAssetsActions.gotCurrencyHistory,
            failure: ResDexAssetsActions.getCurrencyHistoryFailed
          }}
        />

				{ /* Status column container */}
				<div className={cn(styles.statusContainer, HLayout.hBoxChild)}>

					{ /* Resistance status coloumn */}
					<div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>{t(`Resistance status`)}</div>
						<div className={styles.statusColoumnValue}>
              <span className={styles.nodeStatusContainer}>
                <i className={this.getLocalNodeStatusClassNames()} />
                <span>{t(childProcess.getStatusName(this.props.settings.childProcessesStatus.NODE))}</span>
              </span>
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
