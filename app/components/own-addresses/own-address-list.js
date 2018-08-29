// @flow
import React, { Component } from 'react'
import classNames from 'classnames'

import { truncateAmount } from '../../constants'
import { AddressRow } from '../../state/reducers/own-addresses/own-addresses.reducer'

import styles from './own-address-list.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'

type Props = {
	addresses: AddressRow[],
  frozenAddresses: { [string]: Decimal },
	onAddressRowClicked: (event: any, address: string) => void
}

export default class OwnAddressList extends Component<Props> {
	props: Props

	onContextMenu(event: any, address: string) {
    event.preventDefault()

    if (Object.keys(this.props.frozenAddresses).length) {
      return false
    }

    window.getSelection().removeAllRanges()

		if (this.props.onAddressRowClicked) {
			this.props.onAddressRowClicked(event, address)
		}
    return false
	}

  getAddressDisplayBalance(address: AddressRow) {
    const frozenBalance = this.props.frozenAddresses[address.address]
    const balance = frozenBalance === undefined ? address.balance : frozenBalance
    return balance === null ? 'ERROR' : truncateAmount(balance)
  }

	getConfirmValue(tempAddressRow: AddressRow) {
    if (!tempAddressRow || !tempAddressRow.balance) {
      return ''
    }

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
        className={classNames(HLayout.hBoxContainer, styles.tableBodyRow, {[styles.mergingContainer]: this.props.frozenAddresses[addressRow.address] !== undefined})}
        key={addressRow.address}
        onContextMenu={e => this.onContextMenu(e, addressRow.address)}
      >
        {Boolean(this.props.frozenAddresses[addressRow.address]) &&
          <div className={styles.merging}><span>merging</span></div>
        }
        <div className={styles.tableBodyRowColumnBalance} >{this.getAddressDisplayBalance(addressRow)}</div>
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
