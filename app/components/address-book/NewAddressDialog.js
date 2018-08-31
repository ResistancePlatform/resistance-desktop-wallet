// @flow
import { clipboard } from 'electron'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

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

    const submitAction = (
      this.props.newAddressDialog.isInEditMode
        ? this.props.actions.updateAddress
        : this.props.actions.addAddress
    )

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
					name="name"
          defaultValue={this.props.newAddressDialog.fields.name}
					label="Name"
					addon={nameAddon}
          error={this.props.newAddressDialog.validationErrors.name}
          onChange={value => this.props.actions.validateField(
            'name', value, () => this.props.actions.updateNameField(value)
          )}
				/>

				{/* Address */}
				<RoundedInput
					name="address"
          defaultValue={this.props.newAddressDialog.fields.address}
					label="Address"
					addon={addressAddon}
          error={this.props.newAddressDialog.validationErrors.address}
          onChange={value => this.props.actions.validateField(
            'address', value, () => this.props.actions.updateAddressField(value)
          )}
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
            onClick={() => this.props.actions.validateForm(submitAction)}
            onKeyDown={() => {}}
            disabled={this.props.newAddressDialog.isSubmitButtonDisabled}
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
