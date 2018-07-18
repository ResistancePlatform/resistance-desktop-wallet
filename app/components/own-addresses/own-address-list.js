// @flow
import React, { Component } from 'react'
import { AddressRow } from '../../state/reducers/own-addresses/own-addresses.reducer'
import styles from './own-address-list.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'

type Props = {
	addresses: AddressRow[]
}

export default class OwnAddressList extends Component<Props> {
	props: Props

	getAddressTable() {
		if (!this.props.addresses || this.props.addresses.length <= 0) {
			return (
				<div />
			)
		}

		const tableBody = this.props.addresses.map((addrewwRow) => (
			<div className={[HLayout.hBoxContainer, styles.tableBodyRow].join(' ')} key={addrewwRow.address}>
				<div className={styles.tableBodyRowColumnType} >{addrewwRow.balance ? addrewwRow.balance.toFixed(2) : 0}</div>
				<div className={styles.tableBodyRowColumnDirection}>{addrewwRow.confirmed ? 'YES' : 'NO'}</div>
				<div className={[HLayout.hBoxChild, styles.tableBodyRowColumnAddress].join(' ')}>{addrewwRow.address}</div>
			</div>
		))

		return (
			<div className={[styles.tableContainer].join(' ')}>
				<div className={[HLayout.hBoxContainer, styles.tableHeader].join(' ')}>
					<div className={styles.tableHeaderColumnType}>Balance</div>
					<div className={styles.tableHeaderColumnConfirmed}>Confirmed</div>
					<div className={[HLayout.hBoxChild, styles.tableHeaderColumnAddress].join(' ')}>Address</div>
				</div>

				{tableBody}
			</div>
		)
	}

	render() {
		return (
			<div className={[VLayout.vBoxChild, styles.ownAddressListContainer].join(' ')} data-tid="transaction-list-container">
				{this.getAddressTable()}
			</div>
		)
	}
}
