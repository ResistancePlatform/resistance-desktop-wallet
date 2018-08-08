// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'

import { appStore } from '../../state/store/configureStore'
import { SettingsActions, SettingsState } from '../../state/reducers/settings/settings.reducer'
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
      className={styles.statusModal}
      contentLabel="Services Status"
      >
      <h2>Hello</h2>
      <button
      onClick={event => this.onCloseStatusModalClicked(event)}
      onKeyDown={event => this.onCloseStatusModalClicked(event)}
      >
      Close
      </button>
      <div>I am a modal</div>

      </Modal>
    )
  }
}

const mapStateToProps = state => ({
	settings: state.settings,
})

export default connect(mapStateToProps, null)(StatusModal)
