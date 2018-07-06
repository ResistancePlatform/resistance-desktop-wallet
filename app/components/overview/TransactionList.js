// @flow
import React, { Component } from 'react'
import styles from './Balance.scss'
// import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'

type Props = {}

export default class TransactionList extends Component<Props> {
  props: Props

  render() {
    return (
      <div className={[VLayout.vBoxChild, styles.transactionListContainer].join(' ')} data-tid="balance-container">
            Transaction List
      </div>
    )
  }
}
