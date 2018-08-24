// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { clipboard } from 'electron'

import { AddressBookActions, AddressBookState, AddressBookRow } from '../../state/reducers/address-book/address-book.reducer'
import { appStore } from '../../state/store/configureStore'
import AddressBookList from '../../components/address-book/address-book-list'
import RoundedInput, { RoundedInputAddon } from '../../components/rounded-input'

import styles from './address-book.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'

type Props = {
	addressBook: AddressBookState
}

/**
 * @class AddressBook
 * @extends {Component<Props>}
 */
class AddressBook extends Component<Props> {
	props: Props

	componentDidMount() {
		appStore.dispatch(AddressBookActions.loadAddressBook())
	}

	/**
	 * @param {*} event
	 */
	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

	/**
	 * @param {*} event
	 */
	commonMenuItemEventHandler(event) {
		this.eventConfirm(event)
		appStore.dispatch(AddressBookActions.updateDropdownMenuVisibility(false))
	}

	/**
	 * @param {*} event
	 */
	hideDropdownMenu(event) {
		this.commonMenuItemEventHandler(event)
	}

	/**
	 * @param {*} event
	 */
	onAddNewButtonClicked(event) {
		this.eventConfirm(event)
		appStore.dispatch(AddressBookActions.updateNewAddressDialogVisibility(true))
	}

	/**
	 * @param {*} event
	 */
	onCloseButtonClicked(event) {
		this.eventConfirm(event)
		appStore.dispatch(AddressBookActions.updateNewAddressDialogVisibility(false))
	}

	/**
	 * @param {*} event
	 * @param {string} action
	 * @param {AddressBookRow} addressRow
	 */
	onAddressHandler(event, action: string, addressRow: AddressBookRow) {
		this.commonMenuItemEventHandler(event)
		switch (action) {
			case 'remove':
				appStore.dispatch(AddressBookActions.removeAddress(addressRow))
				break

			case 'copy':
				appStore.dispatch(AddressBookActions.copyAddress(addressRow))
				break

			default:
				break
		}
	}

	/**
	 * @param {*} value
	 */
	onNameInputChanged(value) {
		appStore.dispatch(AddressBookActions.updateNewAddressDialogName(value))
	}

	/**
	 * @param {*} value
	 */
	onAddressInputChanged(value) {
		appStore.dispatch(AddressBookActions.updateNewAddressDialogAddress(value))
	}

	/**
	 * @memberof AddressBook
	 */
	onAddressPasteClicked() {
		appStore.dispatch(AddressBookActions.updateNewAddressDialogAddress(clipboard.readText()))
	}

	/**
	 * @param {*} event
	 */
	onCancelButtonClicked(event) {
		this.eventConfirm(event)
		appStore.dispatch(AddressBookActions.updateNewAddressDialogVisibility(false))
	}

	/**
	 * @param {*} event
	 */
	onAddButtonClicked(event) {
		this.eventConfirm(event)
		appStore.dispatch(AddressBookActions.addAddress())
	}

	/**
	 */
	renderNewAddressDialog() {
		if (!this.props.addressBook.newAddressDialog) return null

		const nameAddon: RoundedInputAddon = {
			enable: false,
			type: 'TEXT_PLACEHOLDER',
			onAddonClicked: () => { },
			value: ''
		}

		const addressAddon: RoundedInputAddon = {
			enable: true,
			type: 'PASTE',
			onAddonClicked: () => this.onAddressPasteClicked()
		}

		return (
			<div className={styles.newAddressContainer}>
				{ /* Close button */}
				<div
					className={[styles.closeButton, 'icon-close'].join(' ')}
					onClick={(event) => this.onCloseButtonClicked(event)}
					onKeyDown={() => { }}
				/>

				{ /* Title */}
				<div className={styles.title}>New Address</div>

				{ /* Name */}
				<RoundedInput
					name="new-address-name"
          defaultValue={this.props.addressBook.newAddressDialog.name}
					title="NAME"
					addon={nameAddon}
					onChange={value => this.onNameInputChanged(value)}
				/>

				{ /* Address */}
				<RoundedInput
					name="new-address-address"
          defaultValue={this.props.addressBook.newAddressDialog.address}
					title="ADDRESS"
					addon={addressAddon}
					onChange={value => this.onAddressInputChanged(value)}
				/>

				{ /* Buttons */}
				<div className={styles.buttonContainer}>
					<button
						className={styles.cancelButton}
						onClick={(event) => this.onCancelButtonClicked(event)}
						onKeyDown={() => { }}
					>CANCEL
					</button>
					<button
						className={styles.addButton}
						onClick={(event) => this.onAddButtonClicked(event)}
						onKeyDown={() => { }}
					>ADD
					</button>
				</div>
			</div>
		)
	}

	/**
	 * @returns
	 */
	render() {
		return (
			// Layout container
			<div
				className={[styles.AddressBookContainer, HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}
				onClick={(event) => this.hideDropdownMenu(event)}
				onKeyDown={() => { }}
			>
				{/* Top bar */}
				<div className={[styles.topBar, HLayout.hBoxContainer].join(' ')}>
					<div className={styles.topBarTitle}>Address Book</div>
					<div className={[styles.topBarButtonContainer, HLayout.hBoxChild].join(' ')}>
						<button
							onClick={(event) => this.onAddNewButtonClicked(event)}
							onKeyDown={() => { }}
						>
							<span className={styles.addIcon}>&#43;</span><span>ADD NEW ADDRESS</span>
						</button>
					</div>
				</div>

				{this.renderNewAddressDialog()}

				{/* Address book list */}
				<AddressBookList addresses={this.props.addressBook.addresses} />
			</div >
		)
	}
}


const mapStateToProps = (state) => ({
	addressBook: state.addressBook
})

export default connect(mapStateToProps, null)(AddressBook)
