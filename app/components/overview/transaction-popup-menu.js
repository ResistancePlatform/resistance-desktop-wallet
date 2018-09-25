// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'

import styles from './transaction-popup-menu.scss'

type Props = {
  t: any,
	show: boolean,
	posX: number,
	posY: number,
	onMenuItemClicked: (name: string) => void
}

class TransactionPopupMenu extends Component<Props> {
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
    const { t } = this.props

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
          role="none"
					className={styles.menuItem}
					onClick={event => this.onMenuItemClicked(event, 'COPY_VALUE')}
					onKeyDown={() => { }}
				>
          {t(`Copy value`)}
				</div>
				<div
          role="none"
					className={styles.menuItem}
					onClick={event => this.onMenuItemClicked(event, 'EXPORT_DATA_TO_.CSV')}
					onKeyDown={() => { }}
				>
          {t(`Export data to .CSV`)}
				</div>
				<div
          role="none"
					className={styles.menuItem}
					onClick={event => this.onMenuItemClicked(event, 'SHOW_DETAILS')}
					onKeyDown={() => { }}
				>
          {t(`Show details`)}
				</div>
				<div
          role="none"
					className={styles.menuItem}
					onClick={event => this.onMenuItemClicked(event, 'SHOW_IN_BLOCK_EXPLORER')}
					onKeyDown={() => { }}
				>
          {t(`Show in Block Explorer`)}
				</div>
				<div
          role="none"
					className={[styles.menuItem, styles.lastMenuItem].join(' ')}
					onClick={event => this.onMenuItemClicked(event, 'SHOW_TRANSACTION_MEMO')}
					onKeyDown={() => { }}
				>
					Show transaction memo
				</div>
			</div>
		)
	}
}

export default translate('overview')(TransactionPopupMenu)
