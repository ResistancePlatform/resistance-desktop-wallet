// @flow
import React, { Component } from 'react'
import styles from './add-address-popup-menu.scss'

type Props = {

}

export default class AddAddressPopupMenu extends Component<Props> {
	props: Props

	render() {
		return (
			<div className={[styles.AddAddressPopupMenuContainer].join(' ')} data-tid="transaction-list-container">
				<div className={styles.menuItem}>NEW TRANSPARENT (K1, JZ) ADDRESS</div>
				<div className={styles.menuItem}>NEW PRIVATE (Z) ADDRESS</div>
				<div className={styles.menuItem}>IMPORT PRIVATE KEY</div>
				<div className={[styles.menuItem, styles.lastMenuItem].join(' ')}>EXPORT PRIVATE KEYS</div>
			</div>
		)
	}
}
