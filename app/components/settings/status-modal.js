// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import { appStore } from '../../state/store/configureStore'
import { SettingsActions, SettingsState } from '../../state/reducers/settings/settings.reducer'
import VLayout from '../../theme/v-box-layout.scss'
import styles from './status-modal.scss'

type Props = {
	settings: SettingsState
}

class StatusModal extends Component<Props> {
	props: Props

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
          </TabPanel>

          <TabPanel>
            Miner Status
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
})

export default connect(mapStateToProps, null)(StatusModal)
