// @flow
import React, { Component } from 'react'
import { Transaction } from '../../state/reducers/overview/overview.reducer'
import styles from './TransactionList.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'

type Props = {
  transactions: Array<Transaction>
}

export default class TransactionList extends Component<Props> {
  props: Props

  getTransactionTable() {
    if (!this.props.transactions || this.props.transactions.length <= 0) {
      return (
        <div>No Transaction.</div>
      )
    }

    // const tableContent = `<table></table>`
    const tableBody = this.props.transactions.map((transaction) => (
      <div className={[HLayout.hBoxContainer, styles.tableBodyRow].join(' ')} key={transaction.transactionId}>
        <div className={styles.tableBodyRowColumnType} >{transaction.type}</div>
        <div className={styles.tableBodyRowColumnDirection}>{transaction.direction}</div>
        <div className={styles.tableBodyRowColumnConfirmed}>{transaction.confirmed}</div>
        <div className={styles.tableBodyRowColumnAmount}>{transaction.amount}</div>
        <div className={styles.tableBodyRowColumnDate}>{transaction.date}</div>
        <div className={[HLayout.hBoxChild, styles.tableBodyRowColumnAddress].join(' ')}>{transaction.destinationAddress}</div>
      </div>
    ))

    return (
      <div className={[styles.tableContainer].join(' ')}>
        <div className={[HLayout.hBoxContainer, styles.tableHeader].join(' ')}>
          <div className={styles.tableHeaderColumnType}>Type</div>
          <div className={styles.tableHeaderColumnDirection}>Diretion</div>
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
      <div className={[VLayout.vBoxChild, styles.transactionListContainer].join(' ')} data-tid="transaction-list-container">
        <div className={styles.title}>Transactions</div>
        {this.getTransactionTable()}
      </div>
    )
  }
}
