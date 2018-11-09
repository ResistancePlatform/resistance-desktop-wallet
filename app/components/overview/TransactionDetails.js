// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'

import { TransactionDetail } from '~/reducers/overview/overview.reducer'

import styles from './TransactionDetails.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'

type Props = {
  t: any,
	transactionDetails: TransactionDetail,
	onBackToTransactionListClick: () => void
}

/**
 * @export
 * @class TransactionDetailList
 * @extends {Component<Props>}
 */
class TransactionDetailList extends Component<Props> {
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
    const { t } = this.props

		if (!this.props.transactionDetails) {
			return (<div className={styles.hasNoDetail}>{t(`No Transaction Detail.`)}</div>)
    }

    if (typeof this.props.transactionDetails === 'string') {
			return (<div className={styles.error}>{t(`Error occurred:`)} {this.props.transactionDetails}</div>)
		}

		const sortedKeys = Object.keys(this.props.transactionDetails).sort()

		const tableBody = sortedKeys.map((key, index) => (
			<div
				className={[HLayout.hBoxContainer, styles.tableBodyRow].join(' ')}
				key={index}
			>
				<div className={styles.tableBodyRowColumnName} >{key}</div>
				<div className={[HLayout.hBoxChild, styles.tableBodyRowColumnValue].join(' ')}>{this.props.transactionDetails[key].toString()}</div>
			</div>
		))

		return (
			<div className={[styles.tableContainer].join(' ')}>

				<div className={[HLayout.hBoxContainer, styles.tableHeader].join(' ')}>
					<div className={styles.tableHeaderColumnName}>{t(`Name`)}</div>
					<div className={[HLayout.hBoxChild, styles.tableHeaderColumnValue].join(' ')}>{t(`Value`)}</div>
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
    const { t } = this.props

		return (
			<div className={[HLayout.hBoxChild, VLayout.vBoxContainer, styles.transactionDetailsListContainer].join(' ')}>
				<div
          role="button"
          tabIndex={0}
					className={styles.backToTransactionList}
					onClick={(event) => this.backToTransactionList(event)}
					onKeyDown={() => { }}
				>
					<span className={styles.arrow}>←</span><span className={styles.text}>{t(`Back to transaction list`)}</span>
				</div>
				<div className={styles.title}>{t(`Transaction Details`)}</div>
				{this.getDetailTable()}
			</div>
		)
	}
}

export default translate('overview')(TransactionDetailList)
