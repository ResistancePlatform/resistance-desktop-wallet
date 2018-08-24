// @flow
import moment from 'moment'
import React, { Component } from 'react'

import { truncateAmount } from '../../constants'
import { Transaction } from '../../state/reducers/overview/overview.reducer'

import styles from './transaction-list.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'

type Props = {
	transactions: Array<Transaction>,
	onTransactionRowClick: (event: any, transactionId: string) => void
}

export default class TransactionList extends Component<Props> {
	props: Props

	rowClicked(event: any, transactionId: string) {
		event.preventDefault()
		event.stopPropagation()

		if (this.props.onTransactionRowClick) {
			this.props.onTransactionRowClick(event, transactionId)
		}
	}

  getTransactionDirection(transaction): string {
    switch (transaction.category) {
      case 'receive':
        return 'In'
      case 'send':
        return 'Out'
      case 'generate':
        return 'Mined'
      case 'immature':
        return 'Immature'
      default:
    }

    return transaction.category
  }

	getTransactionTable() {
		if (!this.props.transactions || this.props.transactions.length <= 0) {
			return (
				<div>No Transaction.</div>
			)
		}

		// const tableContent = `<table></table>`
		const tableBody = this.props.transactions.map((transaction, index) => (
			<div
				className={[HLayout.hBoxContainer, styles.tableBodyRow].join(' ')}
				key={index}
				onClick={(event) => this.rowClicked(event, transaction.transactionId)}
				onContextMenu={(event) => this.rowClicked(event, transaction.transactionId)}
				onKeyDown={() => { }}
			>
				<div className={styles.tableBodyRowColumnType} >{transaction.type}</div>
				<div className={styles.tableBodyRowColumnDirection}>{this.getTransactionDirection(transaction)}</div>
				<div className={styles.tableBodyRowColumnConfirmed}>{transaction.confirmations !== 0 ? 'Yes' : 'No'}</div>
				<div className={styles.tableBodyRowColumnAmount}>{truncateAmount(transaction.amount)}</div>
				<div className={styles.tableBodyRowColumnDate}>{moment.unix(transaction.timestamp).format('L kk:mm:ss')}</div>
				<div className={[HLayout.hBoxChild, styles.tableBodyRowColumnAddress].join(' ')}>{transaction.destinationAddress}</div>
			</div>
		))

		return (
			<div className={[styles.tableContainer].join(' ')}>
				<div className={[HLayout.hBoxContainer, styles.tableHeader].join(' ')}>
					<div className={styles.tableHeaderColumnType}>Type</div>
					<div className={styles.tableHeaderColumnDirection}>Direction</div>
					<div className={styles.tableHeaderColumnConfirmed}>Confirmed</div>
					<div className={styles.tableHeaderColumnAmount}>Amount</div>
					<div className={styles.tableHeaderColumnDate}>Date</div>
					<div className={[HLayout.hBoxChild, styles.tableHeaderColumnAddress].join(' ')}>Destination address</div>
				</div>

				{tableBody}
			</div>
		)
	}

	render() {
		return (
			<div className={[VLayout.vBoxChild, styles.transactionListContainer].join(' ')}>
				<div className={styles.title}>Transactions</div>
				{this.getTransactionTable()}
			</div>
		)
	}
}
