// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import * as Joi from 'joi'
import cn from 'classnames'

import { getPasswordValidationSchema } from '~/utils/auth'
import { SettingsState } from '~/reducers/settings/settings.reducer'
import { ResDexActions } from '~/reducers/resdex/resdex.reducer'
import RoundedInput, { Addon } from '~/components/rounded-form/RoundedInput'
import RoundedForm from '~/components/rounded-form/RoundedForm'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './Login.scss'

class ChoosePortfolioAddon extends Addon {
  render(input) {
    return (
      <div className={styles.choosePortfolioAddon}>
        {input}
        <i className={cn('icon', styles.createIcon)} />
      </div>
    )
  }
}

const getValidationSchema = (t) => Joi.object().keys({
  portfolio: Joi.string().required().label(t(`Portfolio`)),
  password: getPasswordValidationSchema(),
})

type Props = {
  t: any,
  settings: SettingsState,
  actions: object
}

/**
 * @class ResDexLogin
 * @extends {Component<Props>}
 */
class ResDexLogin extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof ResDexLogin
	 */
	render() {
    const { t } = this.props
    // const isMarketMakerRunning = this.props.settings.childProcessesStatus.MARKET_MAKER === 'RUNNING'
    const isMarketMakerRunning = true

    return (
      <div className={cn(styles.container, HLayout.hBoxChild, VLayout.vBoxContainer)}>
        <div className={cn(styles.header)}>
          <img src="assets/images/resdex/logo.svg" alt="ResDEX" />
          ResDEX
        </div>

        <RoundedForm id="resDexLogin" schema={getValidationSchema(t)} className={styles.form}>
          <RoundedInput name="portfolio"
            defaultValue="testfolio"
            newAddon={new ChoosePortfolioAddon()}
            readOnly
          />
          <RoundedInput name="password" password />

          <button
            type="submit"
            className={styles.loginButton}
            onClick={this.props.actions.login}
            disabled={!isMarketMakerRunning}
          >
            { isMarketMakerRunning ? t(`Login`) : t(`Waiting for the ResDEX daemon...`) }
          </button>
        </RoundedForm>

        <a>{t(`Forgot password`)}</a>

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
  actions: bindActionCreators(ResDexActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ResDexLogin))
