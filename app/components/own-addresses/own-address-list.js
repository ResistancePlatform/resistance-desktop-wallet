// @flow
import React, { Component } from 'react'
import { AddressRow } from '../../state/reducers/own-addresses/own-addresses.reducer'
import styles from './own-address-list.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'

type Props = {
	addresses: AddressRow[],
	onAddressRowClicked: (event: any, address: string) => void
}

export default class OwnAddressList extends Component<Props> {
	props: Props

	onRowClicked(event: any, address: string) {
		if (this.props.onAddressRowClicked) {
			this.props.onAddressRowClicked(event, address)
		}
    return false
	}

	getBalanceValue(tempAddressRow: AddressRow) {
		if (!tempAddressRow || tempAddressRow.balance === null || tempAddressRow.balance === undefined) return `0`

		return tempAddressRow.balance === -1 ? `ERROR` : tempAddressRow.balance.toFixed(2)
	}

	getConfirmValue(tempAddressRow: AddressRow) {
		if (!tempAddressRow || tempAddressRow.balance === null || tempAddressRow.balance === undefined || tempAddressRow.balance === -1) return ``

		return tempAddressRow.confirmed ? 'YES' : 'NO'
	}

	getAddressTable() {
		if (!this.props.addresses || this.props.addresses.length <= 0) {
			return (
				<div />
			)
		}

		const tableBody = this.props.addresses.map((addressRow) => (
      <div
        className={[HLayout.hBoxContainer, styles.tableBodyRow].join(' ')}
        key={addressRow.address}
        onClick={e => this.onRowClicked(e, addressRow.address)}
        onContextMenu={e => this.onRowClicked(e, addressRow.address)}
        onKeyDown={() => { }}
      >
        <div className={styles.tableBodyRowColumnBalance} >{this.getBalanceValue(addressRow)}</div>
        <div className={styles.tableBodyRowColumnConfirmed}>{this.getConfirmValue(addressRow)}</div>
        <div className={[HLayout.hBoxChild, styles.tableBodyRowColumnAddress].join(' ')}>{addressRow.address}</div>
      </div>
		))

		return (
			<div className={[styles.tableContainer].join(' ')}>
				<div className={[HLayout.hBoxContainer, styles.tableHeader].join(' ')}>
					<div className={styles.tableHeaderColumnBalance}>Balance</div>
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
