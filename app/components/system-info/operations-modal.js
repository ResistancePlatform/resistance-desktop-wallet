// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'
import moment from 'moment'
import classNames from 'classnames'

import 'react-tabs/style/react-tabs.scss'
import { appStore } from '../../state/store/configureStore'
import { SystemInfoActions } from '../../state/reducers/system-info/system-info.reducer'
import humanizeOperationDescription from './humanize-operation'

import styles from './operations-modal.scss'
import HLayout from '../../theme/h-box-layout.scss'


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
      <div
        className={classNames(HLayout.hBoxContainer, styles.tableBodyRow)}
      >
        <div className={styles.tableColumnOperation} >{humanizeOperationDescription(operation)}</div>
        <div className={styles.tableColumnTriggered} >{moment.unix(operation.creation_time).fromNow()}</div>
        <div className={classNames(styles.tableColumnStatus)}><span className={classNames(styles.operationStatus, styles[operation.status])}>{operation.status}</span></div>
        <div className={styles.tableColumnError} >{operation.error && operation.error.message}</div>
        <div className={styles.tableColumnAmount}>{operation.amounts && operation.amounts[0].amount}</div>
      </div>
    ))
    return rows
  }

  getOperationsTable() {
    return (
      <div className={styles.tableContainer}>
        <div className={classNames(HLayout.hBoxContainer, styles.tableHeader)}>
          <div className={styles.tableColumnOperation}>Operation</div>
          <div className={styles.tableColumnTriggered}>Triggered</div>
          <div className={styles.tableColumnStatus}>Status</div>
          <div className={styles.tableColumnError}>Error</div>
          <div className={styles.tableColumnAmount}>Amount</div>
        </div>
        <div className={styles.tableRowsContainer}>
          {this.getOperationRows()}
        </div>
      </div>
    )
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
            Operations {this.props.systemInfo.operations.length ? `(${this.props.systemInfo.operations.length})`: ``}
          </div>
        </div>

        <div className={styles.operationsModalBody}>
          {this.props.systemInfo.operations.length ? this.getOperationsTable() : `No operations to display.`}
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
