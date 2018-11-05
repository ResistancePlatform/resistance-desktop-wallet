// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import * as Joi from 'joi'
import cn from 'classnames'
import { routerActions } from 'react-router-redux'

import { getPasswordValidationSchema } from '~/utils/auth'
import Logo from './Logo'
import { SettingsState } from '~/reducers/settings/settings.reducer'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexLoginActions } from '~/reducers/resdex/login/reducer'
import {
  RoundedForm,
  RoundedButton,
  RoundedInput,
  ChoosePortfolioInput
} from '~/components/rounded-form'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import resDexStyles from './ResDex.scss'
import styles from './Login.scss'

const getValidationSchema = t => (
  Joi.object().keys({
    portfolioId: Joi.string().required().label(t(`Portfolio`)),
    resDexPassword: getPasswordValidationSchema().label(`ResDEX password`),
    walletPassword: getPasswordValidationSchema().label(`Wallet password`),
  })
)

type Props = {
  t: any,
  resDex: ResDexState,
  settings: SettingsState,
  actions: object,
  routerActions: object
}

/**
 * @class ResDexLogin
 * @extends {Component<Props>}
 */
class ResDexLogin extends Component<Props> {
	props: Props

	/**
	 * @memberof ResDexLogin
	 */
	componentDidMount() {
    this.props.actions.getPortfolios()
  }

	/**
	 * @returns
   * @memberof ResDexLogin
	 */
	render() {
    const { t } = this.props

    const isNodeRunning = this.props.settings.childProcessesStatus.NODE === 'RUNNING'
    const isDisabled = !isNodeRunning || this.props.resDex.login.isInProgress

    return (
      <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, resDexStyles.resDexContainer)}>
        <div className={cn(styles.container, HLayout.hBoxChild, VLayout.vBoxContainer)}>
          <Logo />
          <RoundedForm id="resDexLogin" schema={getValidationSchema(t)} className={styles.form}>
            <ChoosePortfolioInput
              name="portfolioId"
              defaultValue="testfolio"
              onCreatePortfolioClick={() => this.props.routerActions.push('/resdex/start')}
              portfolios={this.props.resDex.login.portfolios}
              readOnly
              large
            />

            <RoundedInput
              name="resDexPassword"
              type="password"
              placeholder={t(`ResDEX password`)}
              large
            />

            <RoundedInput
              name="walletPassword"
              type="password"
              placeholder={t(`Wallet password`)}
              large
            />

            <RoundedButton
              type="submit"
              className={styles.loginButton}
              onClick={this.props.actions.login}
              spinner={isDisabled}
              disabled={isDisabled}
              important
              large
            >
              {t(`Login`)}
            </RoundedButton>

          </RoundedForm>

          <a role="button"
            className={styles.forgotPassword}
            tabIndex={0}
            onClick={() => this.props.routerActions.push('/resdex/forgot-password')}
            onKeyDown={ () => false }
          >{t(`Forgot password`)}</a>

        </div>
      </div>
    )
  }

}

const mapStateToProps = state => ({
  resDex: state.resDex,
  settings: state.settings,
  form: state.roundedForm.authLogin
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexLoginActions, dispatch),
  routerActions: bindActionCreators(routerActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ResDexLogin))
