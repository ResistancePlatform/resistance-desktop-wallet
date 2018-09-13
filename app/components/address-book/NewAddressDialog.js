// @flow
import * as Joi from 'joi'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import ValidateAddressService from '~/service/validate-address-service'
import RoundedInput, { RoundedInputAddon } from '~/components/rounded-form/RoundedInput'
import RoundedForm from '~/components/rounded-form/RoundedForm'
import { AddressBookActions, AddressBookState } from '~/state/reducers/address-book/address-book.reducer'

import styles from './NewAddressDialog.scss'


const validateAddress = new ValidateAddressService()

const validationSchema = Joi.object().keys({
  name: Joi.string().required().label(`Name`),
  address: (
    validateAddress.getJoi()
    .resistanceAddress()
    .rZ().rLength().zLength().valid()
    .required().label(`Address`)
  )
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
			onClick: () => { },
			value: ''
		}

		return (
			<div className={styles.newAddressContainer}>

				{/* Close button */}
				<div
          role="button"
          tabIndex={0}
					className={[styles.closeButton, 'icon-close'].join(' ')}
					onClick={this.props.actions.close}
					onKeyDown={() => {}}
				/>

				{/* Title */}
        <div className={styles.title}>
          { this.props.newAddressDialog.isInEditMode ? `Edit Address` : `New Address` }
        </div>

        <RoundedForm
          id="addressBookNewAddressDialog"
          schema={validationSchema}
        >
          {/* Name */}
          <RoundedInput
            name="name"
            defaultValue={this.props.newAddressDialog.defaultValues.name}
            label="Name"
            addon={nameAddon}
          />

          {/* Address */}
          <RoundedInput
            name="address"
            defaultValue={this.props.newAddressDialog.defaultValues.address}
            label="Address"
            addon={{ enable: true, type: 'PASTE' }}
          />

          { /* Buttons */}
          <div className={styles.buttonContainer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={this.props.actions.close}
              onKeyDown={() => {}}
            >Cancel
            </button>

            <button
              type="submit"
              className={styles.addButton}
              onClick={this.props.newAddressDialog.isInEditMode
                ? this.props.actions.updateAddress
                : this.props.actions.addAddress}
              onKeyDown={() => {}}
            >{ this.props.newAddressDialog.isInEditMode ? 'Edit' : 'Add' }
            </button>
          </div>
        </RoundedForm>
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	newAddressDialog: state.addressBook.newAddressDialog
})

const mapDispatchToProps = dispatch => ({ actions: bindActionCreators(AddressBookActions.newAddressDialog, dispatch) })

export default connect(mapStateToProps, mapDispatchToProps)(NewAddressDialog)
