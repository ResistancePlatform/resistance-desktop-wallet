// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { LazyLog } from 'react-lazylog'

import 'react-tabs/style/react-tabs.scss'
import { OSService } from '../../service/os-service'
import { appStore } from '../../state/store/configureStore'
import { SettingsActions, SettingsState } from '../../state/reducers/settings/settings.reducer'
import VLayout from '../../theme/v-box-layout.scss'
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
        className={[styles.statusModal, VLayout.vBoxContainer].join(' ')}
        contentLabel="Services Status"
      >
        <div className={[styles.modalTitle, VLayout.vBoxChild].join(' ')}>
          <div
            className={styles.closeButton}
            onClick={event => this.onCloseStatusModalClicked(event)}
            onKeyDown={event => this.onCloseStatusModalClicked(event)}
          />
          Services Status
        </div>

        <Tabs>
          <TabList>
            <Tab>Local Node</Tab>
            <Tab>Miner</Tab>
            <Tab>Tor</Tab>
          </TabList>

          <TabPanel>
            Local Node Status
            <table>
              <tbody>
                <tr>
                  <td>Balance</td><td>{nodeInfo.balance}</td>
                  <td>Blocks</td><td>{nodeInfo.blocks}</td>
                  <td>Connections</td><td>{nodeInfo.connections}</td>
                  <td>Difficulty</td><td>{nodeInfo.difficulty}</td>
                  <td>Errors</td><td>{nodeInfo.errors}</td>
                  <td>Key Pool Oldest</td><td>{nodeInfo.keypoololdest}</td>
                  <td>Key Pool Size</td><td>{nodeInfo.keypoolsize}</td>
                  <td>Pay TX Fee</td><td>{nodeInfo.paytxfee}</td>
                  <td>Protocol Version</td><td>{nodeInfo.protocolversion}</td>
                  <td>Proxy</td><td>{nodeInfo.proxy}</td>
                  <td>Relay Fee</td><td>{nodeInfo.relayfee}</td>
                  <td>Testnet</td><td>{nodeInfo.testnet}</td>
                  <td>Time Offset</td><td>{nodeInfo.timeoffset}</td>
                  <td>Version</td><td>{nodeInfo.version}</td>
                  <td>Wallet Version</td><td>{nodeInfo.walletversion}</td>
                </tr>
              </tbody>
            </table>
          </TabPanel>

          <TabPanel>
            Miner Status
            <p>Log Output</p>
            <LazyLog url={this.minerLogPath} follow />
          </TabPanel>

          <TabPanel>
            Tor Status
          </TabPanel>
        </Tabs>

        <button
          onClick={event => this.onCloseStatusModalClicked(event)}
          onKeyDown={event => this.onCloseStatusModalClicked(event)}
        >
          Close
        </button>

      </Modal>
    )
  }
}

const mapStateToProps = state => ({
	settings: state.settings,
	systemInfo: state.systemInfo
})

export default connect(mapStateToProps, null)(StatusModal)
