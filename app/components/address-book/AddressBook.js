// @flow
import React, { Component } from 'react'
import cn from 'classnames'

import { AddressBookState } from '~/state/reducers/address-book/address-book.reducer'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import NewAddressDialog from './NewAddressDialog'
import AddressBookList from './AddressBookList'

import styles from './AddressBook.scss'
import HLayout from '~/theme/h-box-layout.scss'
import VLayout from '~/theme/v-box-layout.scss'

const addressBookPopupMenuId = 'address-book-row-popup-menu-id'

type Props = {
  t: any,
  actions: object,
  popupMenu: object,
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
	 * @returns
	 */
	render() {
    const { t } = this.props

		return (
      /* Layout container */
			<div
        role="none"
				className={cn(styles.AddressBookContainer, HLayout.hBoxChild, VLayout.vBoxContainer)}
				onKeyDown={() => {}}
			>

				{/* Top bar */}
				<div className={cn(styles.topBar, HLayout.hBoxContainer)}>
					<div className={styles.topBarTitle}>Address Book</div>
					<div className={cn(styles.topBarButtonContainer, HLayout.hBoxChild)}>
						<button
              type="button"
              onClick={() => this.props.actions.openNewAddressDialog()}
							onKeyDown={() => {}}
						>
							<span className={styles.addIcon}>&#43;</span><span>{t(`Add new address`)}</span>
						</button>
					</div>
				</div>

        <NewAddressDialog />

        <AddressBookList
          items={this.props.addressBook.records}
          onRowContextMenu={(e, record) => this.props.popupMenu.show(addressBookPopupMenuId, e.clientY, e.clientX, record)}
        />

				<PopupMenu id={addressBookPopupMenuId}>
          <PopupMenuItem onClick={(e, record) => this.props.actions.openNewAddressDialog(record)}>
            {t(`Edit address`)}
          </PopupMenuItem>
          <PopupMenuItem onClick={(e, record) => this.props.actions.copyAddress(record)}>
            {t(`Copy Address`)}
          </PopupMenuItem>
          <PopupMenuItem onClick={(e, record) => this.props.actions.confirmAddressRemoval(record)}>
            {t(`Remove Address`)}
          </PopupMenuItem>
				</PopupMenu>

			</div>
		)
	}
}
