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
import StatusModal from '~/components/settings/status-modal'
import OperationsModal from '~/components/system-info/OperationsModal'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { SendCurrencyActions, SendCurrencyState } from '~/reducers/send-currency/send-currency.reducer'
import { SettingsActions, SettingsState } from '~/reducers/settings/settings.reducer'
import { SystemInfoActions, SystemInfoState } from '~/reducers/system-info/system-info.reducer'
import { ToggleButton } from '~/components/rounded-form'

import styles from './StatusIcons.scss'


const miningTooltipId = 'status-icons-mining-tooltip-id'
const privateTransactionsTooltipId = 'status-icons-private-transactions-tooltip-id'
const torTooltipId = 'status-icons-tor-tooltip-id'
const operationsTooltipId = 'status-icons-operations-tooltip-id'

type Props = {
  t: () => string,
  settings: SettingsState,
  resDex: ResDexState,
  sendCurrency: SendCurrencyState,
	systemInfo: SystemInfoState,
  settingsActions: SettingsActions,
  systemInfoActions: SystemInfoActions,
  sendCurrencyActions: SendCurrencyActions
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
          onClick={e => this.onOperationsIconClicked(e)}
          onKeyDown={e => this.onOperationsIconClicked(e)}
        >
          {pendingNumber}
        </span>
      )
    }
    return iconHint
  }

  getOperationsIconTooltip() {
    const { t } = this.props

    if (!this.props.systemInfo.operations.length) {
      return t(`No pending operations`)
    }

    return t(
      `{{pendingNumber}} pending, {{successNumber}} complete, {{failedNumber}} failed operations`, {
        pendingNumber: this.getOperationsCount('queued', 'executing'),
        successNumber: this.getOperationsCount('success'),
        failedNumber: this.getOperationsCount('failed')
      }
    )
  }

	/**
	 * @returns
	 * @memberof StatusIcons
	 */
	render() {
    const { t } = this.props
    const {
      isMinerEnabled,
      isTorEnabled,
      childProcessesStatus
    } = this.props.settings
    const { arePrivateTransactionsEnabled } = this.props.sendCurrency
    const miningDescription = this.getMiningStateDescription()

    return (
      <div>
        <div className={cn(styles.container, {[styles.hidden]: this.props.resDex.common.isExpanded})}>
          <div
            className={cn('icon', styles.mining, { [styles.active]: childProcessesStatus.MINER === 'RUNNING' })}
            data-tip
            data-for={miningTooltipId}
            data-place="bottom"
            data-event="mouseover"
          />

          <ReactTooltip
            id={miningTooltipId}
            globalEventOff="click"
            className={cn(styles.tooltip)}
          >

            <div className={styles.title}>
              {t(`Mining status`)}
            </div>

            <div className={styles.toggleContainer}>
              <div className={cn(styles.label, {[styles.active]: !isMinerEnabled})}>{t(`Off`)}</div>
                <ToggleButton
                  value={isMinerEnabled}
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
            className={cn('icon', styles.privateTransactions, { [styles.active]: arePrivateTransactionsEnabled })}
            data-tip
            data-for={privateTransactionsTooltipId}
            data-place="top"
            data-event="mouseover"
          />

          <ReactTooltip
            id={privateTransactionsTooltipId}
            globalEventOff="click"
            className={cn(styles.tooltip)}
          >
            <div className={styles.title}>
              {t(`Private transactions`)}
            </div>

            <div className={styles.toggleContainer}>
              <div className={cn(styles.label, {[styles.active]: !arePrivateTransactionsEnabled})}>{t(`Off`)}</div>
              <ToggleButton
                value={arePrivateTransactionsEnabled}
                onChange={this.props.sendCurrencyActions.togglePrivateSend}
              />
              <div className={cn(styles.label, {[styles.active]: arePrivateTransactionsEnabled})}>{t(`On`)}</div>
            </div>
          </ReactTooltip>

          <div
            className={cn('icon', styles.tor, { [styles.active]: childProcessesStatus.TOR === 'RUNNING' })}
            data-tip
            data-for={torTooltipId}
            data-place="top"
            data-event="mouseover"
          />

          <ReactTooltip
            id={torTooltipId}
            globalEventOff="click"
            className={cn(styles.tooltip)}
          >
            <div className={styles.title}>
              {t(`Tor status`)}
            </div>

            <div className={styles.toggleContainer}>
              <div className={cn(styles.label, {[styles.active]: !isTorEnabled})}>{t(`Off`)}</div>
              <ToggleButton
                value={isTorEnabled}
                onChange={this.props.settingsActions.toggleTor}
                disabled={getTorDisabledAttribute(childProcessesStatus, this.props.systemInfo)}
              />
              <div className={cn(styles.label, {[styles.active]: isTorEnabled})}>{t(`On`)}</div>
            </div>

            <div
              role="link"
              tabIndex={0}
              className={styles.description}
              onClick={() => this.props.settingsActions.openStatusModal(4)}
              onKeyDown={() => false}
            >
              {t(`Show Tor logs`)}
            </div>

          </ReactTooltip>

          <div
            role="none"
            className={cn('icon', styles.operations, { [styles.active]: this.props.systemInfo.operations.length } )}
            onClick={this.props.systemInfoActions.openOperationsModal}
            onKeyDown={() => false}
            data-tip
            data-for={operationsTooltipId}
            data-event="mouseover"
          />

          {this.getOperationIconHint()}

          <ReactTooltip
            id={operationsTooltipId}
            globalEventOff="click"
            className={cn(styles.tooltip)}
          >
            <div className={styles.title}>
              {t(`Operations`)}
            </div>

            <div className={styles.text}>
              {this.getOperationsIconTooltip()}
            </div>

            <div
              role="link"
              tabIndex={0}
              className={styles.description}
              onClick={this.props.systemInfoActions.openOperationsModal}
              onKeyDown={() => false}
            >
              {t(`Show details`)}
            </div>

          </ReactTooltip>
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
	sendCurrency: state.sendCurrency,
	settings: state.settings,
  systemInfo: state.systemInfo,
  resDex: state.resDex,
})

const mapDispatchToProps = dispatch => ({
  settingsActions: bindActionCreators(SettingsActions, dispatch),
  systemInfoActions: bindActionCreators(SystemInfoActions, dispatch),
  sendCurrencyActions: bindActionCreators(SendCurrencyActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('other')(StatusIcons))
