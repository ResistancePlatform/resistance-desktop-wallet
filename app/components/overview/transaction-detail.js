// @flow
import React, { Component } from 'react'
import { TransactionDetail } from '../../state/reducers/overview/overview.reducer'
import styles from './transaction-detail.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'

type Props = {
	transactionDetail: TransactionDetail,
	onBackToTransactionListClick: () => void
}

/**
 * @export
 * @class TransactionDetailList
 * @extends {Component<Props>}
 */
export default class TransactionDetailList extends Component<Props> {
	props: Props

	/**
	 * @param {*} event
	 * @memberof TransactionDetailList
	 */
	backToTransactionList(event: any) {
		event.preventDefault()
		event.stopPropagation()

		if (this.props.onBackToTransactionListClick) {
			this.props.onBackToTransactionListClick()
		}
	}

	/**
	 * @returns
	 * @memberof TransactionDetailList
	 */
	getDetailTable() {
		if (!this.props.transactionDetail) {
			return (<div className={styles.hasNoDetail}>No Transaction Detail.</div>)
		} else if (typeof this.props.transactionDetail === 'string') {
			return (<div className={styles.error}>Error happend: {this.props.transactionDetail}</div>)
		}

		const sortedKeys = Object.keys(this.props.transactionDetail).sort()
		const tableBody = sortedKeys.map((key, index) => (
			<div
				className={[HLayout.hBoxContainer, styles.tableBodyRow].join(' ')}
				key={index}
			>
				<div className={styles.tableBodyRowColumnName} >{key}</div>
				<div className={[HLayout.hBoxChild, styles.tableBodyRowColumnValue].join(' ')}>{this.props.transactionDetail[key].toString()}</div>
			</div>
		))

		return (
			<div className={[styles.tableContainer].join(' ')}>

				<div className={[HLayout.hBoxContainer, styles.tableHeader].join(' ')}>
					<div className={styles.tableHeaderColumnName}>Name</div>
					<div className={[HLayout.hBoxChild, styles.tableHeaderColumnValue].join(' ')}>Value</div>
				</div>

				{tableBody}
			</div>
		)
	}

	/**
	 * @returns
	 * @memberof TransactionDetailList
	 */
	render() {
		return (
			<div className={[HLayout.hBoxChild, VLayout.vBoxContainer, styles.transactionDetailListContainer].join(' ')}>
				<div
					className={styles.backToTransactionList}
					onClick={(event) => this.backToTransactionList(event)}
					onKeyDown={() => { }}
				>
					<span className={styles.arrow}>←</span><span className={styles.text}>BACK TO TRANSACTION LIST</span>
				</div>
				<div className={styles.title}>Transaction Details</div>
				{this.getDetailTable()}
			</div>
		)
	}
}
