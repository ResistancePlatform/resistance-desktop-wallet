// @flow
import React, { Component } from 'react'
import { AddressDropdownItem } from '../../state/reducers/send-cash/send-cash.reducer'
import styles from './address-drodown-popup-menu.scss'

type Props = {
	addressList?: AddressDropdownItem[],
	onPickupAddress: (address: string) => void
}

export default class AddressDropdownPopupMenu extends Component<Props> {
	props: Props

	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

	onAddressItemClicked(event, selectedAddress: string) {
		this.eventConfirm(event)
		if (this.props.onPickupAddress) {
			this.props.onPickupAddress(event, selectedAddress)
		}
	}

	renderAddressItems() {
		if (!this.props.addressList ||
			!Array.isArray(this.props.addressList) ||
			this.props.addressList.length <= 0) {
			return (
				<div
					className={styles.lastMenuItem}
					onClick={event => this.onAddressItemClicked(event, '')}
					onKeyDown={() => { }}
				>
					Have no any available address
				</div>
			)
		}

		return this.props.addressList.map((addressItem, index) => (
			<div
				className={[
					index === this.props.addressList.length - 1 ? styles.lastMenuItem : styles.menuItem,
					addressItem.disabled ? styles.disabledMenItem : ''
				].join(' ')}
				onClick={event => this.onAddressItemClicked(event, addressItem.address ? addressItem.address : '')}
				onKeyDown={() => { }}
				key={index}
			>
				<div className={styles.itemRowAddress}>{addressItem.address}</div>
				<div className={styles.itemRowBalance}>
					{addressItem.balance.toString()} RES
				</div>
			</div>
		))
	}

	render() {
		return (
			<div className={[styles.AddressDropdownPopupMenuContainer].join(' ')}>
				{this.renderAddressItems()}
			</div>
		)
	}
}
