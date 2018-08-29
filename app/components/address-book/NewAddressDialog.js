// @flow
import { clipboard } from 'electron'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import RoundedInput, { RoundedInputAddon } from '../../components/rounded-input'
import { AddressBookActions, AddressBookState } from '../../state/reducers/address-book/address-book.reducer'

import styles from './NewAddressDialog.scss'

type Props = {
  hide: func,
  updateName: func,
  updateAddress: func,
  addAddressRecord: func,
  updateAddressRecord: func,
  newAddressDialog: AddressBookState.newAddressDialog
}

/**
 * @class AddressDialog
 * @extends {Component<Props>}
 */
class NewAddressDialog extends Component<Props> {
	props: Props

	render() {
		if (!this.props.newAddressDialog.isVisible) return null

		const nameAddon: RoundedInputAddon = {
			enable: false,
			type: 'TEXT_PLACEHOLDER',
			onAddonClicked: () => { },
			value: ''
		}

		const addressAddon: RoundedInputAddon = {
			enable: true,
			type: 'PASTE',
			onAddonClicked: () => this.props.updateAddress(clipboard.readText())
		}

		return (
			<div className={styles.newAddressContainer}>

				{/* Close button */}
				<div
					className={[styles.closeButton, 'icon-close'].join(' ')}
					onClick={this.props.hide}
					onKeyDown={() => {}}
				/>

				{/* Title */}
        <div className={styles.title}>
          { this.props.newAddressDialog.isInUpdateMode ? `Update Address` : `New Address` }
        </div>

				{/* Name */}
				<RoundedInput
					name="new-address-name"
          defaultValue={this.props.newAddressDialog.name}
					label="NAME"
					addon={nameAddon}
					onChange={value => this.props.updateName(value)}
				/>

				{/* Address */}
				<RoundedInput
					name="new-address-address"
          defaultValue={this.props.newAddressDialog.address}
					label="Address"
					addon={addressAddon}
					onChange={value => this.props.updateAddress(value)}
				/>

				{ /* Buttons */}
				<div className={styles.buttonContainer}>
					<button
						className={styles.cancelButton}
						onClick={this.props.hide}
						onKeyDown={() => {}}
					>Cancel
					</button>

          <button
            className={styles.addButton}
            onClick={this.props.newAddressDialog.isInUpdateMode ? this.props.updateAddressRecord : this.props.addAddressRecord}
            onKeyDown={() => {}}
          >{ this.props.newAddressDialog.isInUpdateMode ? 'Update' : 'Add' }
          </button>
				</div>
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	newAddressDialog: state.addressBook.newAddressDialog
})

const mapDispatchToProps = () => AddressBookActions.newAddressDialog

export default connect(mapStateToProps, mapDispatchToProps)(NewAddressDialog)
