// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import styles from './add-address-popup-menu.scss'

type Props = {
  t: any,
	onAddNewTransparentAddressHandler: () => void,
	onAddNewPrivateAddressHandler: () => void,
	onImportPrivateKeyHandler: () => void,
	onExportPrivateKeysHandler: () => void
}

class AddAddressPopupMenu extends Component<Props> {
	props: Props

	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

	onAddNewTransparentAddressClicked(event) {
		this.eventConfirm(event)
		if (this.props.onAddNewTransparentAddressHandler) {
			this.props.onAddNewTransparentAddressHandler(event)
		}
	}

	onAddNewPrivateAddressClicked(event) {
		this.eventConfirm(event)
		if (this.props.onAddNewPrivateAddressHandler) {
			this.props.onAddNewPrivateAddressHandler(event)
		}
	}

	onImportPrivateKeyClicked(event) {
		this.eventConfirm(event)
		if (this.props.onImportPrivateKeyHandler) {
			this.props.onImportPrivateKeyHandler(event)
		}
	}

	onExportPrivateKeysClicked(event) {
		this.eventConfirm(event)
		if (this.props.onExportPrivateKeysHandler) {
			this.props.onExportPrivateKeysHandler(event)
		}
	}

	render() {
    const { t } = this.props

		return (
			<div className={[styles.AddAddressPopupMenuContainer].join(' ')}>
				<div
          role="none"
					className={styles.menuItem}
					onClick={event => this.onAddNewTransparentAddressClicked(event)}
					onKeyDown={event => this.onAddNewTransparentAddressClicked(event)}
				>
          {t(`New transparent (R) address`)}
				</div>
				<div
          role="none"
					className={styles.menuItem}
					onClick={event => this.onAddNewPrivateAddressClicked(event)}
					onKeyDown={event => this.onAddNewPrivateAddressClicked(event)}
				>
          {t(`New private (Z) address`)}
				</div>
				<div
          role="none"
					className={styles.menuItem}
					onClick={event => this.onImportPrivateKeyClicked(event)}
					onKeyDown={event => this.onImportPrivateKeyClicked(event)}
				>
          {t(`Import private key`)}
				</div>
				<div
          role="none"
					className={[styles.menuItem, styles.lastMenuItem].join(' ')}
					onClick={event => this.onExportPrivateKeysClicked(event)}
					onKeyDown={event => this.onExportPrivateKeysClicked(event)}
				>
          {t(`Export private keys`)}
				</div>
			</div>
		)
	}
}
export default translate('own-addresses')(AddAddressPopupMenu)
