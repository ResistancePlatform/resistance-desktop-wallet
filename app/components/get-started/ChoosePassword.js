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
  password: (
    Joi.string().required()
    .regex(/^[a-zA-Z0-9]{8,30}$/)
    .error(() => `should contain latin letters, numbers and special characters`)
    .label(`Password`)
  ),
  confirmPassword: (
    Joi.string().required().valid(Joi.ref('password'))
    .label(`Confirm password`)
    .options({
      language: {
        any: {
          allowOnly: '!!Passwords do not match',
        }
      }
    })
  )
})

type Props = {
  getStarted: object,
  form: object
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
    const prevPath = this.props.getStarted.isCreatingNewWallet ? 'create-new-wallet' : 'restore-your-wallet'

		return (
      <div className={classNames(HLayout.hBoxChild, VLayout.vBoxContainer, styles.getStartedContainer)}>
        <div className={styles.title}>Choose password for your wallet</div>

        <div className={styles.hint}>Enter a strong password (using letters, numbers and/or symbols)</div>

        <RoundedForm id="getStartedChoosePassword" schema={validationSchema} important >

          <RoundedInput name="password" password label="Password" />
          <RoundedInput name="confirmPassword" password label="Confirm password" />

          <div className={styles.note}><strong>Note:</strong> If you loose or forget this password, it cannot be recovered.
            Your wallet can only be restored from it&#39;s 25 word mnemonic seed.</div>

          <PasswordStrength password={this.props.form && this.props.form.fields.password} />

          <NavLink className={styles.prevLink} to={`/get-started/${prevPath}`} />
          <NavLink className={styles.nextLink} type="submit" role="button" to="/get-started/welcome" />

          <div className={styles.paginationDots}>
            <div className={styles.complete} />
            <div className={styles.complete} />
            <div className={styles.empty} />
          </div>

        </RoundedForm>
      </div>
    )
  }
}

