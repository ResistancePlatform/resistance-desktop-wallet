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
        <td>{operation.method}</td>
        <td>{operation.params.fromaddress}</td>
        <td>{operation.params.amounts && operation.params.amounts[0].address}</td>
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
        className={styles.operationsModal}
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

        <div className={styles.operationsModalBody}>
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

        <div className={styles.modalFooter}>
          <button
            className={styles.clearButton}
            onClick={event => this.onClearCompletedClicked(event)}
            onKeyDown={event => this.onClearCompletedClicked(event)}
          >
            Clear completed
          </button>

          <button
            className={styles.closeButton}
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
