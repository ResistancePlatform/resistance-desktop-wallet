import { EOL } from 'os'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { ChildProcessService } from '~/service/child-process-service'
import OperationsModal from '~/components/system-info/OperationsModal'
import { SendCashState } from '~/reducers/send-cash/send-cash.reducer'
import { SettingsState } from '~/reducers/settings/settings.reducer'
import { SystemInfoActions, SystemInfoState } from '~/reducers/system-info/system-info.reducer'

import styles from './StatusIcons.scss'


const childProcess = new ChildProcessService()

type Props = {
  t: () => string,
  settings: SettingsState,
  sendCash: SendCashState,
	systemInfo: SystemInfoState,
  systemInfoActions: SystemInfoActions
}

/**
 * @class StatusIcons
 * @extends {Component<Props>}
 */
class StatusIcons extends Component<Props> {
	props: Props

  getMinerStatusIconTitle() {
    const { t } = this.props
    const minerStatus = this.props.settings.childProcessesStatus.MINER

    if (minerStatus !== 'RUNNING') {
      const minerStatusName = childProcess.getStatusName(minerStatus)
      return `${t('Miner status:')} ${minerStatusName}`
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

	/**
	 * @returns
	 * @memberof StatusIcons
	 */
	render() {
    const { t } = this.props

    return (
      <div>
        <div className={cn(styles.container)}>
          <div
            className={cn('icon', styles.mining, { [styles.active]: this.props.settings.childProcessesStatus.MINER === 'RUNNING' })}
            title={this.getMinerStatusIconTitle()}
          />

          <div
            className={cn('icon', styles.privateTransactions, { [styles.active]: this.props.sendCash.isPrivateTransactions  })}
            title={
              this.props.sendCash.isPrivateTransactions
                ? t(`Private transactions are enabled`)
                : t(`Private transactions are disabled`)
            }
          />

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
        <OperationsModal />
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
  systemInfoActions: bindActionCreators(SystemInfoActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('other')(StatusIcons))
