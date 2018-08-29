// @flow
import React, { Component } from 'react'
import { AddressBookRow } from '../../state/reducers/address-book/address-book.reducer'

import styles from './AddressBookList.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'

type Props = {
	addresses: AddressBookRow[],
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
		if (!this.props.addresses || !Array.isArray(this.props.addresses) || this.props.addresses.length <= 0) {
			return (<div className={styles.hasNoDetail}>You don't have any contact address yet.</div>)
		}

		const tableBody = this.props.addresses.map((tempAddressRow, index) => (
			<div
				className={[HLayout.hBoxContainer, styles.tableBodyRow].join(' ')}
				key={index}
				onContextMenu={e => this.onContextMenu(e, tempAddressRow)}
			>
				<div className={styles.tableBodyRowColumnName} >{tempAddressRow.name}</div>
				<div className={[HLayout.hBoxChild, styles.tableBodyRowColumnValue].join(' ')}>{tempAddressRow.address}</div>
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
