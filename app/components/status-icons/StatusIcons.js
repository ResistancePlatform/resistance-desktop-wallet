import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import ReactTooltip from 'react-tooltip'

import {
  getMiningDisabledAttribute,
  getTorDisabledAttribute,
} from '~/utils/child-process'
import { ChildProcessService } from '~/service/child-process-service'
import StatusModal from '~/components/settings/status-modal'
import OperationsModal from '~/components/system-info/OperationsModal'
import { SendCashActions, SendCashState } from '~/reducers/send-cash/send-cash.reducer'
import { SettingsActions, SettingsState } from '~/reducers/settings/settings.reducer'
import { SystemInfoActions, SystemInfoState } from '~/reducers/system-info/system-info.reducer'
import { ToggleButton } from '~/components/rounded-form'

import styles from './StatusIcons.scss'


const childProcess = new ChildProcessService()
const miningTooltipId = 'status-icons-mining-tooltip-id'
const privateTransactionsTooltipId = 'status-icons-private-transactions-tooltip-id'
const torTooltipId = 'status-icons-tor-tooltip-id'

type Props = {
  t: () => string,
  settings: SettingsState,
  sendCash: SendCashState,
	systemInfo: SystemInfoState,
  settingsActions: SettingsActions,
  systemInfoActions: SystemInfoActions
}

/**
 * @class StatusIcons
 * @extends {Component<Props>}
 */
class StatusIcons extends Component<Props> {
	props: Props

  getMiningStateDescription(): string | null {
    const { t } = this.props
    const { MINER: minerStatus } = this.props.settings.childProcessesStatus

    if (minerStatus !== 'RUNNING') {
      return null
    }

    const minerInfo = this.props.systemInfo.miner

    const description = t(`Got {{blocksNumber}} blocks at {{hashingPower}} khash/s`, {
      blocksNumber: minerInfo.minedBlocksNumber,
      hashingPower: minerInfo.hashingPower
    })

    return description
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

	/**
	 * @returns
	 * @memberof StatusIcons
	 */
	render() {
    const { t } = this.props
    const { isMinerEnabled, childProcessesStatus } = this.props.settings
    const { isPrivateTransactions } = this.props.sendCash
    const miningDescription = this.getMiningStateDescription()

    return (
      <div>
        <div className={cn(styles.container)}>
          <div
            className={cn('icon', styles.mining, { [styles.active]: childProcessesStatus.MINER === 'RUNNING' })}
            data-tip="tooltip"
            data-for={miningTooltipId}
            data-place="bottom"
            data-event="mouseover"
            data-event-off="click mouseout"
          />

          <ReactTooltip id={miningTooltipId} className={cn(styles.tooltip)}>
            <div className={styles.title}>
              {t(`Mining status`)}
            </div>

            <div className={styles.toggleContainer}>
              <div className={cn(styles.label, {[styles.active]: !isMinerEnabled})}>{t(`Off`)}</div>
                <ToggleButton
                  defaultValue={isMinerEnabled}
                  onChange={this.props.settingsActions.toggleMiner}
                  disabled={getMiningDisabledAttribute(childProcessesStatus)}
                />
              <div className={cn(styles.label, {[styles.active]: isMinerEnabled})}>{t(`On`)}</div>
            </div>

            {miningDescription &&
              <div
                role="link"
                tabIndex={0}
                className={styles.description}
                onClick={() => this.props.settingsActions.openStatusModal(3)}
                onKeyDown={() => false}
              >
                {miningDescription}
              </div>
            }

          </ReactTooltip>

          <div
            className={cn('icon', styles.privateTransactions, { [styles.active]: isPrivateTransactions })}
            data-tip="tooltip"
            data-for={privateTransactionsTooltipId}
            data-place="top"
            data-event="mouseover"
            data-event-off="click mouseout"
          >
            <ReactTooltip id={miningTooltipId} className={cn(styles.tooltip)}>
              <div className={styles.title}>
                {t(`Private transactions`)}
              </div>

              <div className={styles.toggleContainer}>
                <div className={cn(styles.label, {[styles.active]: !isPrivateTransactions})}>{t(`Off`)}</div>
                <ToggleButton
                  defaultValue={isPrivateTransactions}
                  onChange={this.props.sendCashActions.togglePrivateSend}
                />
                <div className={cn(styles.label, {[styles.active]: isPrivateTransactions})}>{t(`On`)}</div>
              </div>
            </ReactTooltip>
          </div>

          <div
            className={cn('icon', styles.tor, { [styles.active]: this.props.settings.childProcessesStatus.TOR === 'RUNNING' })}
            title={t(`Tor status: {{status}}`, { status: childProcess.getStatusName(this.props.settings.childProcessesStatus.TOR) })}
          />

          <div
            role="none"
            className={cn('icon', styles.operations, { [styles.active]: this.props.systemInfo.operations.length } )}
            title={this.getOperationsIconTitle()}
            onClick={this.props.systemInfoActions.openOperationsModal}
            onKeyDown={this.props.systemInfoActions.openOperationsModal}
          />
          {this.getOperationIconHint()}

        </div>

        {this.props.settings.isStatusModalOpen &&
          <StatusModal />
        }

        {this.props.systemInfo.isOperationsModalOpen &&
          <OperationsModal />
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({
	sendCash: state.sendCash,
	settings: state.settings,
  systemInfo: state.systemInfo,
})

const mapDispatchToProps = dispatch => ({
  settingsActions: bindActionCreators(SettingsActions, dispatch),
  systemInfoActions: bindActionCreators(SystemInfoActions, dispatch),
  sendCashActions: bindActionCreators(SendCashActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('other')(StatusIcons))
