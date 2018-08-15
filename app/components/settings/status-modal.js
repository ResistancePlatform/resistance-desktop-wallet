// @flow
import * as fs from 'fs';

import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { LazyLog } from 'react-lazylog'
import classNames from 'classnames'

import 'react-tabs/style/react-tabs.scss'
import { OSService, ChildProcessName } from '../../service/os-service'
import { appStore } from '../../state/store/configureStore'
import { SettingsActions, SettingsState } from '../../state/reducers/settings/settings.reducer'
import styles from './status-modal.scss'

const osService = new OSService()

const processNames = ['NODE', 'MINER', 'TOR']

type Props = {
	settings: SettingsState,
  systemInfo: SystemInfoState
}

type ModalState = {
  processLogFilesPath: { [ChildProcessName]: string },
  selectedTabIndex: number
}

class StatusModal extends Component<Props> {
	props: Props
  state: ModalState
  refreshPathKey: number

  constructor(props) {
    super(props)
    this.state = {
      processLogFilesPath: {},
      selectedTabIndex: 0
    }
    this.refreshPathKey = 0
  }

	/**
	 * @memberof StatusModal
	 */
	componentDidMount() {
    Modal.setAppElement('#App')
    this.checkLogFilesExistence()
  }

	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

  onTabSelected(index: number) {
    this.setState({ selectedTabIndex: index })
    this.checkLogFilesExistence()
  }

	/**
   * Check every process log file for accessibility.
   *
	 * @memberof StatusModal
	 */
  checkLogFilesExistence() {
    processNames.forEach((processName) => {
      let logFilePath = osService.getLogFilePath(processName)

      fs.access(logFilePath, err => {
        if (err) {
          logFilePath = null
        }
        this.setState({ processLogFilesPath:  { ...this.state.processLogFilesPath, [processName]: logFilePath } })
      })
    })
  }

  getLazyLogElement(processName: ChildProcessName) {
    if (this.state.processLogFilesPath[processName]) {
      return (
        <LazyLog url={this.state.processLogFilesPath[processName]} selectableLines follow style={{ backgroundColor: 'rgb(21, 26, 53)' }} />
      )
    }

    return (
      <span>The log file for {processName} doesn&apos;t exist yet. Start the process in order to have something here.</span>
    )
  }

  getChildProcessStatusClassNames(processName: ChildProcessName) {
    const processStatus = this.props.settings.childProcessesStatus[processName]
    const statusClassNames = [styles.statusIcon]

    if (processStatus === 'RUNNING' || processStatus === 'STARTING') {
      statusClassNames.push('icon-status-running')
    } else {
      statusClassNames.push('icon-status-stop')
    }

    switch (processStatus) {
      case 'RUNNING':
        statusClassNames.push(styles.green)
        break
      case 'STARTING':
      case 'RESTARTING':
      case 'STOPPING':
        statusClassNames.push(styles.yellow)
        break
      case 'NOT RUNNING':
      case 'FAILED':
      case 'MURDER FAILED':
        statusClassNames.push(styles.red)
        break
      default:
    }

    return statusClassNames.join(' ')
  }

  getIsRefreshButtonDisabled() {
    const processName = processNames[this.state.selectedTabIndex - 1]
    return this.state.selectedTabIndex === 0 || this.state.processLogFilesPath[processName] === null
  }

  onRefreshClicked(event) {
		this.eventConfirm(event)

    const processName = processNames[this.state.selectedTabIndex - 1]
    const logFilePath = osService.getLogFilePath(processName)
    const pathWithRefreshKey = `${logFilePath}?refreshPathKey=${this.refreshPathKey}`

    this.setState({ processLogFilesPath:  { ...this.state.processLogFilesPath, [processName]: pathWithRefreshKey } })
    this.refreshPathKey++
  }

  onCloseClicked(event) {
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
            onClick={event => this.onCloseClicked(event)}
            onKeyDown={event => this.onCloseClicked(event)}
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
            onSelect={(index) => {this.onTabSelected(index)}}
          >
            <TabList className={styles.tabList}>
              <Tab className={styles.tab}>Get Info</Tab>
              <Tab className={styles.tab}>
                <i
                  className={this.getChildProcessStatusClassNames('NODE')}
                  title={this.props.settings.childProcessesStatus.NODE}
                />
                Node Log
              </Tab>
              <Tab className={styles.tab}>
                <i
                  className={this.getChildProcessStatusClassNames('MINER')}
                  title={this.props.settings.childProcessesStatus.MINER}
                />
                Miner Log
              </Tab>
              <Tab className={styles.tab}>
                <i
                  className={this.getChildProcessStatusClassNames('TOR')}
                  title={this.props.settings.childProcessesStatus.TOR}
                />
                Tor Log
              </Tab>
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
              {this.getLazyLogElement('NODE')}

            </TabPanel>

            <TabPanel>
              {this.getLazyLogElement('MINER')}
            </TabPanel>

            <TabPanel>
              {this.getLazyLogElement('TOR')}
            </TabPanel>
          </Tabs>
        </div>

        <div className={styles.statusModalFooter}>
          <button
            onClick={event => this.onRefreshClicked(event)}
            onKeyDown={event => this.onRefreshClicked(event)}
            disabled={this.getIsRefreshButtonDisabled()}
          >
            Refresh
          </button>

          <button
            onClick={event => this.onCloseClicked(event)}
            onKeyDown={event => this.onCloseClicked(event)}
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
  systemInfo: state.systemInfo,
})

export default connect(mapStateToProps, null)(StatusModal)
