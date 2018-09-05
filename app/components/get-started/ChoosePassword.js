// @flow
import React, { Component } from 'react'
import classNames from 'classnames'
import { NavLink } from 'react-router-dom'
import * as Joi from 'joi'

import RoundedInput from '~/components/rounded-form/RoundedInput'
import RoundedForm from '~/components/rounded-form/RoundedForm'
import PasswordStrength from '~/components/password-strength/PasswordStrength'

import HLayout from '~/theme/h-box-layout.scss'
import VLayout from '~/theme/v-box-layout.scss'
import styles from './GetStarted.scss'

const validationSchema = Joi.object().keys({
  // #?!@$%^&*-'`;
  password: Joi.string().required().regex(/^[a-zA-Z0-9]{8,30}$/),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')).options({
    language: {
      any: {
        allowOnly: '!!Passwords do not match',
      }
    }
  })
})

type Props = {
  actions: Object,
	choosePassword: Object
}


/**
 * @class ChoosePassword
 * @extends {Component<Props>}
 */
export class ChoosePassword extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof ChoosePassword
	 */
	render() {
		return (
      <div className={classNames(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <h1>Choose password for your wallet</h1>

        <p>Enter a strong password (using letters, numbers and/or symbols)</p>

        <RoundedForm
          schema={validationSchema}
          fields={this.props.choosePassword.fields}
          onValidate={this.props.actions.updateValidationErrors}
        >
          <RoundedInput
            name="password"
            type="password"
            defaultValue={this.props.choosePassword.fields.password}
            label="Password"
            error={this.props.choosePassword.validationErrors.password}
            onChange={value => this.props.actions.updateField('password', value)}
          />

          <RoundedInput
            name="confirm-password"
            type="password"
            defaultValue={this.props.choosePassword.fields.confirmPassword}
            label="Confirm password"
            error={this.props.choosePassword.validationErrors.confirmPassword}
            onChange={value => this.props.actions.updateField('confirmPassword', value)}
          />

          <p>Note: If you loose or forget this password, it cannot be recovered. Your wallet can only be restored from it&#39;s 25 word mnemonic seed.</p>

          <PasswordStrength password={this.props.choosePassword.fields.password} />

          <NavLink to="/get-started/create-new-wallet">Prev</NavLink>
          <NavLink type="submit" role="button" to="/get-started/welcome">Next</NavLink>
        </RoundedForm>
      </div>
    )
  }
}

