// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import * as Joi from 'joi'
import cn from 'classnames'

import { RoundedFormRoot } from '~/reducers/rounded-form/rounded-form.reducer'
import { SettingsState } from '~/reducers/settings/settings.reducer'
import { AuthState, AuthActions } from '~/reducers/auth/auth.reducer'
import TitleBarButtons, { DragBar } from '~/components/title-bar-buttons/TitleBarButtons'
import RoundedInput from '~/components/rounded-form/RoundedInput'
import RoundedForm from '~/components/rounded-form/RoundedForm'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'

import resistanceLogo from '~/assets/images/logo.svg'
import styles from './Login.scss'

const getValidationSchema = t => Joi.object().keys({
  password: (
    Joi.string().required()
    .min(6)
    .token()
    .label(t(`Password`))
  )
})

type Props = {
  t: any,
  auth: AuthState,
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
        <TitleBarButtons />
        <DragBar />

        <div className={styles.dragBar} />

        <div className={cn(styles.header, { [styles.ready]: this.props.form && this.props.form.isValid })}>
          <img src={resistanceLogo} alt="Resistance" />
          {this.props.auth.enter ? t(`Enter Resistance`) : t(`Confirm your login`)}
        </div>

        {this.props.auth.reason &&
          <div className={styles.reason}>
            {this.props.auth.reason}
          </div>
        }

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
  auth: state.auth,
  settings: state.settings,
  form: state.roundedForm.authLogin
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(AuthActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('other')(Login))
