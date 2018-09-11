// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'
import moment from 'moment'
import classNames from 'classnames'

import 'react-tabs/style/react-tabs.scss'
import { appStore } from '~/state/store/configureStore'
import { UniformList, UniformListHeader, UniformListRow, UniformListColumn} from '~/components/uniform-list'
import { SystemInfoActions } from '~/state/reducers/system-info/system-info.reducer'
import humanizeOperationName from './humanize-operation'

import styles from './OperationsModal.scss'


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

  getSortedOperations() {
    const sortedOperations = this.props.systemInfo.operations.sort((first, second) => {
      const isPending = operation => Number(['queued', 'executing'].includes(operation.status))
      const priorityComparisonResult = isPending(first) - isPending(second)
      return priorityComparisonResult !== 0 ? -priorityComparisonResult : second.creation_time - first.creation_time
    })

    return sortedOperations
  }

  getListRowRenderer(operation) {
    return (
      <UniformListRow key={operation.id}>
        <UniformListColumn>
          {humanizeOperationName(operation)}
        </UniformListColumn>
        <UniformListColumn>
          {moment.unix(operation.creation_time).fromNow()}
        </UniformListColumn>
        <UniformListColumn>
          <span className={classNames(styles.operationStatus, styles[operation.status])}>{operation.status}</span>
        </UniformListColumn>
        <UniformListColumn>
          {operation.error && operation.error.message}
        </UniformListColumn>
        <UniformListColumn>
          {operation.params && operation.params.amounts && operation.params.amounts[0].amount}
        </UniformListColumn>
        <UniformListColumn>
          {operation.params && operation.params.fee}
        </UniformListColumn>
      </UniformListRow>
    )
  }

  getListHeaderRenderer() {
    return (
      <UniformListHeader>
        <UniformListColumn width="15%">Operation</UniformListColumn>
        <UniformListColumn width="15%">Triggered</UniformListColumn>
        <UniformListColumn width="10%">Status</UniformListColumn>
        <UniformListColumn width="30%">Error</UniformListColumn>
        <UniformListColumn width="10%">Amount</UniformListColumn>
        <UniformListColumn width="10%">Fee</UniformListColumn>
      </UniformListHeader>
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
            role="button"
            tabIndex={0}
            className={styles.closeButton}
            onClick={event => this.onCloseClicked(event)}
            onKeyDown={event => this.onCloseClicked(event)}
          />
          <div className={styles.titleText}>
            Operations {this.props.systemInfo.operations.length ? `(${this.props.systemInfo.operations.length})`: ``}
          </div>
        </div>

        <div className={styles.operationsModalBody}>
          <UniformList
            items={this.props.systemInfo.operations}
            headerRenderer={() => this.getListHeaderRenderer()}
            rowRenderer={operation => this.getListRowRenderer(operation)}
            emptyMessage="No operations to display."
          />
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
            type="button"
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
