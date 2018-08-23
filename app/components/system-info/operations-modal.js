// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'
import moment from 'moment'
import classNames from 'classnames'

import 'react-tabs/style/react-tabs.scss'
import { appStore } from '../../state/store/configureStore'
import { SystemInfoActions } from '../../state/reducers/system-info/system-info.reducer'
import humanizeOperationName from './humanize-operation'

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

  onClearCompletedClicked() {
    return false
  }

  onCloseClicked() {
		appStore.dispatch(SystemInfoActions.closeOperationsModal())
    return false
  }

  getOperationRows() {
    const sortedOperations = this.props.systemInfo.operations.sort((first, second) => {
      const isPending = operation => Number(['queued', 'executing'].includes(operation.status))
      const priorityComparisonResult = isPending(first) - isPending(second)
      return priorityComparisonResult !== 0 ? -priorityComparisonResult : second.creation_time - first.creation_time
    })

    const rows = sortedOperations.map(operation => (
      <div
        className={classNames(HLayout.hBoxContainer, styles.tableBodyRow)}
      >
        <div className={styles.tableColumnOperation} >{humanizeOperationName(operation)}</div>
        <div className={styles.tableColumnTriggered} >{moment.unix(operation.creation_time).fromNow()}</div>
        <div className={classNames(styles.tableColumnStatus)}>
          <span className={classNames(styles.operationStatus, styles[operation.status])}>{operation.status}</span>
        </div>
        <div className={styles.tableColumnError} >{operation.error && operation.error.message}</div>
        <div className={styles.tableColumnAmount}>{operation.params && operation.params.amounts && operation.params.amounts[0].amount}</div>
        <div className={styles.tableColumnFee}>{operation.params && operation.params.fee}</div>
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
          <div className={styles.tableColumnFee}>Fee</div>
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
          {/*
          <button
            className={styles.clearButton}
            onClick={event => this.onClearCompletedClicked(event)}
            onKeyDown={event => this.onClearCompletedClicked(event)}
          >
            Clear completed
          </button>
          */}

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
