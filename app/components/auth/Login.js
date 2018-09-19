// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import * as Joi from 'joi'
import cn from 'classnames'

import { RoundedFormRoot } from '~/state/reducers/rounded-form/rounded-form.reducer'
import { SettingsState } from '~/state/reducers/settings/settings.reducer'
import { AuthActions } from '~/state/reducers/auth/auth.reducer'
import RoundedInput from '~/components/rounded-form/RoundedInput'
import RoundedForm from '~/components/rounded-form/RoundedForm'
import HLayout from '~/theme/h-box-layout.scss'
import VLayout from '~/theme/v-box-layout.scss'

import styles from './Login.scss'

const getValidationSchema = t => Joi.object().keys({
  // #?!@$%^&*-'`;
  password: (
    Joi.string().required()
    .regex(/^[a-zA-Z0-9]{8,30}$/)
    .error(() => t(`should contain latin letters, numbers and special characters`))
    .label(t(`Password`))
  )
})

type Props = {
  t: any,
  settings: SettingsState,
  form: RoundedFormRoot | undefined,
  actions: object
}

/**
 * @class Login
 * @extends {Component<Props>}
 */
class Login extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof Login
	 */
	render() {
    const { t } = this.props
    const isNodeRunning = this.props.settings.childProcessesStatus.NODE === 'RUNNING'

    return (
      <div className={cn(styles.container, HLayout.hBoxChild, VLayout.vBoxContainer)}>
        <div className={cn(styles.title, { [styles.ready]: this.props.form && this.props.form.isValid })}>{t(`Enter Resistance`)}</div>

        <RoundedForm id="authLogin" schema={getValidationSchema(t)} className={styles.form}>
          <RoundedInput name="password" password label={t(`Password`)} />

          <button
            type="submit"
            className={styles.loginButton}
            onClick={this.props.actions.submitPassword}
            onKeyDown={this.props.actions.submitPassword}
            disabled={!isNodeRunning}
          >
            { isNodeRunning ? t(`Submit`) : t(`Waiting for the daemon...`) }
          </button>
        </RoundedForm>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  settings: state.settings,
  form: state.roundedForm.authLogin
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(AuthActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('other')(Login))
