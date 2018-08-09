// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { LazyLog } from 'react-lazylog'
import classNames from 'classnames'

import 'react-tabs/style/react-tabs.scss'
import { OSService } from '../../service/os-service'
import { appStore } from '../../state/store/configureStore'
import { SettingsActions, SettingsState } from '../../state/reducers/settings/settings.reducer'
import styles from './status-modal.scss'

const osService = new OSService()

type Props = {
	settings: SettingsState,
	systemInfo: SystemInfoState
}

class StatusModal extends Component<Props> {
  minerLogPath: undefined
	props: Props

	constructor() {
    super()
    this.minerLogPath = osService.getLogFilePath('MINER')
  }

	/**
	 * @memberof StatusModal
	 */
	componentDidMount() {
    Modal.setAppElement('#App')
  }

	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

  onCloseStatusModalClicked(event) {
		this.eventConfirm(event)
		appStore.dispatch(SettingsActions.closeStatusModal())
  }

  render() {
    const nodeInfo = this.props.systemInfo.daemonInfo.getInfoResult

    return (
      <Modal
        isOpen={this.props.settings.isStatusModalOpen}
        className={classNames(styles.statusModal)}
        overlayClassName={styles.modalOverlay}
        contentLabel="Services Status"
      >
        <div className={classNames(styles.modalTitle)}>
          <div
            className={styles.closeButton}
            onClick={event => this.onCloseStatusModalClicked(event)}
            onKeyDown={event => this.onCloseStatusModalClicked(event)}
          />
          <div className={styles.titleText}>
            Services Status
          </div>
        </div>

        <div className={classNames(styles.statusModalBody)}>
          <Tabs
            className={styles.tabs}
            selectedTabClassName={styles.selectedTab}
            selectedTabPanelClassName={styles.selectedTabPanel}
          >
            <TabList className={styles.tabList}>
              <Tab className={styles.tab}>Local Node</Tab>
              <Tab className={styles.tab}>Miner</Tab>
              <Tab className={styles.tab}>Tor</Tab>
            </TabList>

            <TabPanel className={styles.tabPanel}>
              <table>
                <tbody>
                  <tr><td width="30%">Balance</td><td>{nodeInfo.balance}</td></tr>
                  <tr><td>Blocks</td><td>{nodeInfo.blocks}</td></tr>
                  <tr><td>Connections</td><td>{nodeInfo.connections}</td></tr>
                  <tr><td>Difficulty</td><td>{nodeInfo.difficulty}</td></tr>
                  <tr><td>Errors</td><td><div>{nodeInfo.errors}</div></td></tr>
                  <tr><td>Key Pool Oldest</td><td>{nodeInfo.keypoololdest}</td></tr>
                  <tr><td>Key Pool Size</td><td>{nodeInfo.keypoolsize}</td></tr>
                  <tr><td>Pay TX Fee</td><td>{nodeInfo.paytxfee}</td></tr>
                  <tr><td>Protocol Version</td><td>{nodeInfo.protocolversion}</td></tr>
                  <tr><td>Proxy</td><td>{nodeInfo.proxy}</td></tr>
                  <tr><td>Relay Fee</td><td>{nodeInfo.relayfee}</td></tr>
                  <tr><td>Testnet</td><td>{nodeInfo.testnet}</td></tr>
                  <tr><td>Time Offset</td><td>{nodeInfo.timeoffset}</td></tr>
                  <tr><td>Version</td><td>{nodeInfo.version}</td></tr>
                  <tr><td>Wallet Version</td><td>{nodeInfo.walletversion}</td></tr>
                </tbody>
              </table>
            </TabPanel>

            <TabPanel>
              <LazyLog url={this.minerLogPath} follow style={{ backgroundColor: 'rgb(21, 26, 53)' }} />
            </TabPanel>

            <TabPanel />
          </Tabs>
        </div>

        <div className={styles.statusModalFooter}>
          <button
            onClick={event => this.onCloseStatusModalClicked(event)}
            onKeyDown={event => this.onCloseStatusModalClicked(event)}
          >
            Close
          </button>
        </div>

      </Modal>
    )
  }
}

const mapStateToProps = state => ({
	settings: state.settings,
	systemInfo: state.systemInfo
})

export default connect(mapStateToProps, null)(StatusModal)
