// @flow
import React, { Component } from 'react'
import { AddressBookRecord } from '../../state/reducers/address-book/address-book.reducer'

import styles from './AddressBookList.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'

type Props = {
	records: AddressBookRecord[],
	onRowClicked: (event: any, address: string) => void
}

/**
 * @export
 * @class AddressBookList
 * @extends {Component<Props>}
 */
export default class AddressBookList extends Component<Props> {
	props: Props

	/**
	 * @param {*} event
	 * @param {AddressBookRow} addressBookRow
	 * @returns
	 * @memberof AddressBookList
	 */
	onContextMenu(event: any, addressBookRow: AddressBookRow) {
		event.preventDefault()
		window.getSelection().removeAllRanges()

		if (this.props.onRowClicked) {
			this.props.onRowClicked(event, addressBookRow)
		}
		return false
	}

	/**
	 * @returns
	 * @memberof AddressBookList
	 */
	renderList() {
		if (!this.props.records.length) {
			return (<div className={styles.hasNoDetail}>You don&#39;t have any contact address yet.</div>)
		}

    // Sort by name
    const sortedRecords = this.props.records.slice(0).sort(
      (record1, record2) => record1.name.localeCompare(record2.name)
    )

		const tableBody = sortedRecords.map((record, index) => (
			<div
				className={[HLayout.hBoxContainer, styles.tableBodyRow].join(' ')}
				key={index}
				onContextMenu={e => this.onContextMenu(e, record)}
			>
				<div className={styles.tableBodyRowColumnName} >{record.name}</div>
				<div className={[HLayout.hBoxChild, styles.tableBodyRowColumnValue].join(' ')}>{record.address}</div>
			</div>
		))

		return (
			<div className={[styles.tableContainer].join(' ')}>

				<div className={[HLayout.hBoxContainer, styles.tableHeader].join(' ')}>
					<div className={styles.tableHeaderColumnName}>Name</div>
					<div className={[HLayout.hBoxChild, styles.tableHeaderColumnValue].join(' ')}>Address</div>
				</div>

				{tableBody}
			</div>
		)
	}

	/**
	 * @returns
	 * @memberof AddressBookList
	 */
	render() {
		return (
			<div className={[HLayout.hBoxChild, VLayout.vBoxContainer, styles.AddressBookListContainer].join(' ')}>
				{this.renderList()}
			</div>
		)
	}
}
