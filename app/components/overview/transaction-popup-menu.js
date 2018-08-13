// @flow
import React, { Component } from 'react'
import styles from './transaction-popup-menu.scss'

type Props = {
	show: boolean,
	posX: number,
	posY: number,
	onMenuItemClicked: (name: string) => void
}

export default class TransactionPopupMenu extends Component<Props> {
	props: Props

	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

	onMenuItemClicked(event: any, name: string) {
		this.eventConfirm(event)

		if (this.props.onMenuItemClicked) {
			this.props.onMenuItemClicked(name)
		}
	}

	render() {
		const containerStyles = {
			display: this.props.show ? 'block' : 'none',
			top: this.props.posY,
			left: this.props.posX
		}

		return (
			<div
				className={[styles.transactionPopupMenuContainer].join(' ')}
				style={containerStyles}
			>
				<div
					className={styles.menuItem}
					onClick={event => this.onMenuItemClicked(event, 'COPY_VALUE')}
					onKeyDown={() => { }}
				>
					COPY VALUE
				</div>
				<div
					className={styles.menuItem}
					onClick={event => this.onMenuItemClicked(event, 'EXPORT_DATA_TO_.CSV')}
					onKeyDown={() => { }}
				>
					EXPORT DATA TO .CSV
				</div>
				<div
					className={styles.menuItem}
					onClick={event => this.onMenuItemClicked(event, 'SHOW_DETAILS')}
					onKeyDown={() => { }}
				>
					SHOW DETAILS
				</div>
				<div
					className={styles.menuItem}
					onClick={event => this.onMenuItemClicked(event, 'SHOW_IN_BLOCK_EXPLORER')}
					onKeyDown={() => { }}
				>
					SHOW IN BLOCK EXPLORER
				</div>
				<div
					className={[styles.menuItem, styles.lastMenuItem].join(' ')}
					onClick={event => this.onMenuItemClicked(event, 'SHOW_TRANSACTION_MEMO')}
					onKeyDown={() => { }}
				>
					SHOW TRANSACTION MEMO
				</div>
			</div>
		)
	}
}
