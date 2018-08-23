// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toastr } from 'react-redux-toastr'
import { AddressBookActions, AddressBookState, AddressBookRow } from '../../state/reducers/address-book/address-book.reducer'
import { PopupMenuActions } from '../../state/reducers/popup-menu/popup-menu.reducer'
import { appStore } from '../../state/store/configureStore'
import AddressBookList from '../../components/address-book/address-book-list'
import RoundedInput, { RoundedInputAddon } from '../../components/rounded-input'
import { PopupMenu, PopupMenuItem } from '../../components/popup-menu'
import styles from './address-book.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'

const addressBookPopupMenuId = 'address-book-row-popup-menu-id'

type Props = {
	addressBook: AddressBookState
}

/**
 * @class AddressBook
 * @extends {Component<Props>}
 */
class AddressBook extends Component<Props> {
	props: Props
	nameInputDomRef: any
	addressInputDomRef: any

	/**
	 *Creates an instance of AddressBook.
	 * @param {*} props
	 */
	constructor(props) {
		super(props)

		// create a ref to specified <input> which inside <RounedInput>
		this.addressDomRef = (element) => { this.addressInputDomRef = element };
		this.nameDomRef = (element) => { this.nameInputDomRef = element };
	}

	/**
	 */
	componentDidMount() {
		appStore.dispatch(AddressBookActions.loadAddressBook())
		this.updateAddressDialogFromExistsState()
	}

	/**
	 * @memberof AddressBook
	 */
	updateAddressDialogFromExistsState() {
		const currentAppState = appStore.getState()
		const dialogState = currentAppState &&
			currentAppState.addressBook &&
			currentAppState.addressBook.addressDialog ? currentAppState.addressBook.addressDialog : null

		if (dialogState) {
			this.nameInputDomRef.inputDomRef.current.value = dialogState.name
			this.addressInputDomRef.inputDomRef.current.value = dialogState.address
		}
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
		appStore.dispatch(AddressBookActions.pasteAddressFromClipboard())

		// Just a workaround at this moment!!!
		setTimeout(() => {
			const currentAppState = appStore.getState()
			this.addressInputDomRef.inputDomRef.current.value = currentAppState.addressBook.addressDialog.address
		}, 100);
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
	 * @param {*} event
	 */
	onUpdateButtonClicked(event) {
		this.eventConfirm(event)
		appStore.dispatch(AddressBookActions.updateAddress())
	}

	/**
	 * @param {*} event
	 * @param {AddressBookRow} addressBookRow
	 * @memberof AddressBook
	 */
	onAddressRowClicked(event, addressBookRow: AddressBookRow) {
		appStore.dispatch(PopupMenuActions.show(addressBookPopupMenuId, event.clientY, event.clientX, addressBookRow))
	}

	/**
	 * @param {*} event
	 * @param {AddressBookRow} addressBookRow
	 * @memberof AddressBook
	 */
	updateAddressClicked(event, addressBookRow: AddressBookRow) {
		appStore.dispatch(AddressBookActions.editAddress(addressBookRow))
		appStore.dispatch(AddressBookActions.updateNewAddressDialogVisibility(true))

		setTimeout(() => this.updateAddressDialogFromExistsState(), 200)
	}

	/**
	 * @param {*} event
	 * @param {AddressBookRow} addressBookRow
	 * @memberof AddressBook
	 */
	copyAddressClicked(event, addressBookRow: AddressBookRow) {
		appStore.dispatch(AddressBookActions.copyAddress(addressBookRow))
	}

	/**
	 * @param {*} event
	 * @param {AddressBookRow} addressBookRow
	 * @memberof AddressBook
	 */
	removeAddressClicked(event, addressBookRow: AddressBookRow) {
		const confirmOptions = { onOk: () => appStore.dispatch(AddressBookActions.removeAddress(addressBookRow)) }
		toastr.confirm(`Are you sure want to remove the address for "${addressBookRow.name}"?`, confirmOptions)
	}

	/**
	 */
	renderNewAddressDialog() {
		if (!this.props.addressBook.addressDialog) return null

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

		const isInUpdateMode = this.props.addressBook.updatingAddress

		const confirmButton = isInUpdateMode ? (
			<button
				className={styles.addButton}
				onClick={(event) => this.onUpdateButtonClicked(event)}
				onKeyDown={() => { }}
			>UPDATE
			</button>
		) : (
			<button
					className={styles.addButton}
					onClick={(event) => this.onAddButtonClicked(event)}
					onKeyDown={() => { }}
			>ADD
			</button>
			)

		const title = isInUpdateMode ? `Update Address` : `New Address`

		return (
			<div className={styles.newAddressContainer}>
				{ /* Close button */}
				<div
					className={[styles.closeButton, 'icon-close'].join(' ')}
					onClick={(event) => this.onCloseButtonClicked(event)}
					onKeyDown={() => { }}
				/>

				{ /* Title */}
				<div className={styles.title}>{title}</div>

				{ /* Name */}
				<RoundedInput
					name="new-address-name"
					title="NAME"
					addon={nameAddon}
					onInputChange={value => this.onNameInputChanged(value)}
					ref={this.nameDomRef}
				/>

				{ /* Address */}
				<RoundedInput
					name="new-address-address"
					title="ADDRESS"
					addon={addressAddon}
					onInputChange={value => this.onAddressInputChanged(value)}
					ref={this.addressDomRef}
				/>

				{ /* Buttons */}
				<div className={styles.buttonContainer}>
					<button
						className={styles.cancelButton}
						onClick={(event) => this.onCancelButtonClicked(event)}
						onKeyDown={() => { }}
					>CANCEL
					</button>
					{confirmButton}
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
				<AddressBookList addresses={this.props.addressBook.addresses} onRowClicked={(e, addressBookRow) => this.onAddressRowClicked(e, addressBookRow)} />

				<PopupMenu id={addressBookPopupMenuId}>
					<PopupMenuItem onClick={(e, address) => this.updateAddressClicked(e, address)}>Update Address</PopupMenuItem>
					<PopupMenuItem onClick={(e, address) => this.copyAddressClicked(e, address)}>Copy Address</PopupMenuItem>
					<PopupMenuItem onClick={(e, address) => this.removeAddressClicked(e, address)}>Remove Address</PopupMenuItem>
				</PopupMenu>

			</div >
		)
	}
}


const mapStateToProps = (state) => ({
	addressBook: state.addressBook
})

export default connect(mapStateToProps, null)(AddressBook)
