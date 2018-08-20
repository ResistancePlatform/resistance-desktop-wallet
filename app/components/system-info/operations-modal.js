// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'
import classNames from 'classnames'

import 'react-tabs/style/react-tabs.scss'
import { appStore } from '../../state/store/configureStore'
import { SystemInfoActions } from '../../state/reducers/system-info/system-info.reducer'
import styles from './operations-modal.scss'


type Props = {
  systemInfo: SystemInfoState
}

class OperationsModal extends Component<Props> {
	props: Props

	/**
	 * @memberof OperationsModal
	 */
	componentDidMount() {
    Modal.setAppElement('#App')
  }

	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

  onCloseClicked(event) {
		this.eventConfirm(event)
		appStore.dispatch(SystemInfoActions.closeOperationsModal())
  }

  getOperationRows() {
    const rows = this.props.systemInfo.operations.map(operation => (
      <tr>
        <td>Unknown</td>
        <td>Unknown</td>
        <td>Unknown</td>
        <td>{operation.status}</td>
        <td />
      </tr>
    ))
    return rows
  }

  render() {
    return (
      <Modal
        isOpen={this.props.systemInfo.isOperationsModalOpen}
        className={classNames(styles.statusModal)}
        overlayClassName={styles.modalOverlay}
        contentLabel="Operations"
      >
        <div className={classNames(styles.modalTitle)}>
          <div
            className={styles.closeButton}
            onClick={event => this.onCloseClicked(event)}
            onKeyDown={event => this.onCloseClicked(event)}
          />
          <div className={styles.titleText}>
            Operations
          </div>
        </div>

        <div className={classNames(styles.statusModalBody)}>
          <table>
            <thead>
              <tr>
                <th width="30%">Operation</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {this.getOperationRows()}
            </tbody>
          </table>
        </div>

        <div className={styles.statusModalFooter}>
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
  systemInfo: state.systemInfo
})

export default connect(mapStateToProps, null)(OperationsModal)
