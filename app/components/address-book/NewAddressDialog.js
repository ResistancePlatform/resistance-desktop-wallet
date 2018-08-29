// @flow
import { clipboard } from 'electron'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import RoundedInput, { RoundedInputAddon } from '../../components/rounded-input'
import { AddressBookActions, AddressBookState } from '../../state/reducers/address-book/address-book.reducer'

import styles from './NewAddressDialog.scss'

type Props = {
  actions: Object,
  newAddressDialog: AddressBookState.newAddressDialog
}

/**
 * @class AddressDialog
 * @extends {Component<Props>}
 */
class NewAddressDialog extends Component<Props> {
	props: Props

	render() {
    if (!this.props.newAddressDialog.isVisible) {
      return null
    }

		const nameAddon: RoundedInputAddon = {
			enable: false,
			type: 'TEXT_PLACEHOLDER',
			onAddonClicked: () => { },
			value: ''
		}

		const addressAddon: RoundedInputAddon = {
			enable: true,
			type: 'PASTE',
			onAddonClicked: () => this.props.actions.updateAddress(clipboard.readText())
		}

		return (
			<div className={styles.newAddressContainer}>

				{/* Close button */}
				<div
					className={[styles.closeButton, 'icon-close'].join(' ')}
					onClick={this.props.actions.close}
					onKeyDown={() => {}}
				/>

				{/* Title */}
        <div className={styles.title}>
          { this.props.newAddressDialog.isInEditMode ? `Edit Address` : `New Address` }
        </div>

				{/* Name */}
				<RoundedInput
					name="new-address-name"
          defaultValue={this.props.newAddressDialog.name}
					label="Name"
					addon={nameAddon}
					onChange={value => this.props.actions.updateName(value)}
				/>

				{/* Address */}
				<RoundedInput
					name="new-address-address"
          defaultValue={this.props.newAddressDialog.address}
					label="Address"
					addon={addressAddon}
					onChange={value => this.props.actions.updateAddress(value)}
				/>

				{ /* Buttons */}
				<div className={styles.buttonContainer}>
					<button
						className={styles.cancelButton}
						onClick={this.props.actions.close}
						onKeyDown={() => {}}
					>Cancel
					</button>

          <button
            className={styles.addButton}
            onClick={this.props.newAddressDialog.isInEditMode
              ? this.props.actions.updateAddressRecord
              : this.props.actions.addAddressRecord}
            onKeyDown={() => {}}
          >{ this.props.newAddressDialog.isInEditMode ? 'Edit' : 'Add' }
          </button>
				</div>
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	newAddressDialog: state.addressBook.newAddressDialog
})

const mapDispatchToProps = dispatch => ({ actions: bindActionCreators(AddressBookActions.newAddressDialog, dispatch) })

export default connect(mapStateToProps, mapDispatchToProps)(NewAddressDialog)
