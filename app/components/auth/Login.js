// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { remote } from 'electron'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import ReactTooltip from 'react-tooltip'
import * as Joi from 'joi'
import cn from 'classnames'

import { getPasswordValidationSchema } from '~/utils/auth'
import { SettingsState } from '~/reducers/settings/settings.reducer'
import { AuthState, AuthActions } from '~/reducers/auth/auth.reducer'
import TitleBarButtons, { DragBar } from '~/components/title-bar-buttons/TitleBarButtons'
import { RoundedForm, RoundedButton, RoundedInput } from '~/components/rounded-form'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import resistanceLogo from '~/assets/images/logo-full.svg'
import styles from './Login.scss'

const getValidationSchema = () => Joi.object().keys({
  password: getPasswordValidationSchema()
})

type Props = {
  t: any,
  auth: AuthState,
  settings: SettingsState,
  actions: object
}

/**
 * @class Login
 * @extends {Component<Props>}
 */
class Login extends Component<Props> {
	props: Props

  constructor(props) {
    super(props)

    this.state = {
      time: moment()
    }
  }

	/**
	 * @memberof Login
	 */
	componentDidMount() {
    this.intervalId = setInterval(
      () => this.setState({ time: moment() }),
      1000
    )
  }

	/**
	 * @memberof Login
	 */
	componentWillUnmount() {
    clearInterval(this.intervalId)
  }

	/**
	 * @memberof Login
	 */
  getIsRescanning() {
    const { NODE: childProcessInfo } = remote.getGlobal('childProcesses')
    const { NODE: nodeStatus } = this.props.settings.childProcessesStatus

    const { timeStarted } = childProcessInfo

    if (!timeStarted || nodeStatus !== 'STARTING') {
      return false
    }

    if (moment(timeStarted).isBefore(this.state.time.subtract(15, 'seconds'))) {
      return true
    }

    return false
  }

	/**
	 * @returns
   * @memberof Login
	 */
	render() {
    const { t } = this.props
    const isNodeRunning = this.props.settings.childProcessesStatus.NODE === 'RUNNING'
    const isRescanning = this.getIsRescanning()

    return (
      <React.Fragment>
        <div className={styles.overlay} data-tip data-for="#loginTooltip" />

        <ReactTooltip id="#loginTooltip" className={styles.tooltip}>
          {t(`Please login in order to access the interface`)}
        </ReactTooltip>

        <div className={cn(styles.container, HLayout.hBoxChild, VLayout.vBoxContainer)}>
          <TitleBarButtons />
          <DragBar />

          <div className={styles.dragBar} />

          <div className={cn(styles.header)}>
            <img src={resistanceLogo} alt="Resistance" />
          </div>

          {this.props.auth.reason &&
            <div className={styles.reason}>
              {this.props.auth.reason}
            </div>
          }

          {isRescanning &&
            <div className={styles.reason}>
              {t(`Please be patient… The blockchain is rescanning. Please don’t quit the application.`)}
            </div>
          }

          <RoundedForm id="authLogin" schema={getValidationSchema()} className={styles.form}>
            <RoundedInput
              name="password"
              type="password"
              placeholder={t(`Enter your password`)}
              large
            />

            <RoundedButton
              type="submit"
              className={styles.loginButton}
              onClick={this.props.actions.submitPassword}
              tooltip={isNodeRunning ? null : t(`Waiting for the daemon...`)}
              spinner={!isNodeRunning}
              disabled={!isNodeRunning}
              important
              large
            >
              {t(`Login`)}
            </RoundedButton>
          </RoundedForm>
        </div>
      </React.Fragment>
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
