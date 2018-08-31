// @flow
import { clipboard } from 'electron'
import * as Joi from 'joi'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import RoundedInput, { RoundedInputAddon } from '../../components/rounded-input'
import FormValidation from '../../components/form-validation/FormValidation'
import { AddressBookActions, AddressBookState } from '../../state/reducers/address-book/address-book.reducer'

import styles from './NewAddressDialog.scss'

const validationSchema = Joi.object().keys({
  name: Joi.string().required().label(`Name`),
  address: Joi.string().required().min(35).max(95).label(`Address`)
})

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

        <FormValidation
          schema={validationSchema}
          fields={this.props.newAddressDialog.fields}
          onValidate={this.props.actions.updateValidationErrors}
        />

				{/* Name */}
				<RoundedInput
					name="name"
          defaultValue={this.props.newAddressDialog.fields.name}
					label="Name"
					addon={nameAddon}
          error={this.props.newAddressDialog.validationErrors.name}
          onChange={value => this.props.actions.updateField('name', value)}
				/>

				{/* Address */}
				<RoundedInput
					name="address"
          defaultValue={this.props.newAddressDialog.fields.address}
					label="Address"
					addon={addressAddon}
          error={this.props.newAddressDialog.validationErrors.address}
          onChange={value => this.props.actions.updateField('address', value)}
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
              ? this.props.actions.updateAddress
              : this.props.actions.addAddress}
            onKeyDown={() => {}}
            disabled={Object.keys(this.props.newAddressDialog.validationErrors).length}
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
