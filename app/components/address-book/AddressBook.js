// @flow
import React, { Component } from 'react'
import classNames from 'classnames'
import { toastr } from 'react-redux-toastr'

import { appStore } from '../../state/store/configureStore'
import { AddressBookActions, AddressBookState, AddressBookRow } from '../../state/reducers/address-book/address-book.reducer'
import { PopupMenu, PopupMenuItem } from '../../components/popup-menu'
import { PopupMenuActions } from '../../state/reducers/popup-menu/popup-menu.reducer'
import NewAddressDialog from './NewAddressDialog'
import AddressBookList from './AddressBookList'

import styles from './AddressBook.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'

const addressBookPopupMenuId = 'address-book-row-popup-menu-id'

type Props = {
  actions: Object,
	addressBook: AddressBookState
}

/**
 * @class AddressBook
 * @extends {Component<Props>}
 */
export class AddressBook extends Component<Props> {
	props: Props

	componentDidMount() {
    this.props.actions.loadAddressBook()
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
	removeAddressClicked(event, addressBookRow: AddressBookRow) {
		const confirmOptions = { onOk: () => appStore.dispatch(AddressBookActions.removeAddress(addressBookRow)) }
		toastr.confirm(`Are you sure want to remove the address for "${addressBookRow.name}"?`, confirmOptions)
	}

	/**
	 * @returns
	 */
	render() {
		return (
      /* Layout container */
			<div
				className={classNames(styles.AddressBookContainer, HLayout.hBoxChild, VLayout.vBoxContainer)}
				onKeyDown={() => {}}
			>

				{/* Top bar */}
				<div className={classNames(styles.topBar, HLayout.hBoxContainer)}>
					<div className={styles.topBarTitle}>Address Book</div>
					<div className={classNames(styles.topBarButtonContainer, HLayout.hBoxChild)}>
						<button
              onClick={this.props.actions.openNewAddressDialog}
							onKeyDown={() => {}}
						>
							<span className={styles.addIcon}>&#43;</span><span>Add New Address</span>
						</button>
					</div>
				</div>

        <NewAddressDialog />

        <AddressBookList
          addresses={this.props.addressBook.addresses}
          onRowClicked={(e, addressBookRow) => this.onAddressRowClicked(e, addressBookRow)}
        />

				<PopupMenu id={addressBookPopupMenuId}>
          <PopupMenuItem onClick={(e, address) => this.props.actions.newAddressDialog(address)}>
            Update Address
          </PopupMenuItem>
          <PopupMenuItem onClick={(e, address) => this.props.actions.copyAddress(address)}>
            Copy Address
          </PopupMenuItem>
          <PopupMenuItem onClick={(e, address) => this.props.actions.removeAddress(address)}>
            Remove Address
          </PopupMenuItem>
				</PopupMenu>

			</div>
		)
	}
}
