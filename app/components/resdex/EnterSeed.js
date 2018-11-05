// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import * as Joi from 'joi'
import cn from 'classnames'
import { routerActions } from 'react-router-redux'

import { SettingsState } from '~/reducers/settings/settings.reducer'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexLoginActions } from '~/reducers/resdex/login/reducer'
import {
  RoundedForm,
  RoundedButton,
  RoundedTextArea,
} from '~/components/rounded-form'
import Logo from './Logo'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import resDexStyles from './ResDex.scss'
import styles from './EnterSeed.scss'

const getValidationSchema = t => (
  Joi.object().keys({
    seedPhrase: Joi.string().required().label(t(`Seed phrase`)),
  })
)

type Props = {
  t: any,
  isRestoring?: boolean,
  resDex: ResDexState,
  settings: SettingsState,
  actions: object,
  routerActions: object
}

/**
 * @class EnterSeed
 * @extends {Component<Props>}
 */
class EnterSeed extends Component<Props> {
	props: Props

	/**
	 * @memberof EnterSeed
	 */
	componentDidMount() {
    this.props.actions.getPortfolios()
  }

	/**
	 * @returns
   * @memberof EnterSeed
	 */
	render() {
    const { t } = this.props
    const { isCreatingPortfolio } = this.props.resDex.login

    const isNodeRunning = this.props.settings.childProcessesStatus.NODE === 'RUNNING'
    const isDisabled = !isNodeRunning || this.props.resDex.login.isInProgress

    return (
      <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, resDexStyles.resDexContainer)}>
        <div className={cn(styles.container, HLayout.hBoxChild, VLayout.vBoxContainer)}>
          <Logo />

          <div className={styles.header}>
            {this.props.isRestoring ? t(`Enter your seed phrase`) : t(`Confirm your seed phrase`)}
          </div>

          <RoundedForm
            id="resDexEnterSeedPhrase"
            schema={getValidationSchema(t, isCreatingPortfolio)}
            className={styles.form}
          >

            <RoundedTextArea
              name="seedPhrase"
              rows={4}
              placeholder={t(`Example: advanced generous profound...`)}
            />

            <RoundedButton
              type="submit"
              className={styles.submitButton}
              onClick={
                this.props.isRestoring
                ? this.props.routerActions.push('/resdex/create-portfolio')
                : this.props.actions.createPortfolio
              }
              spinner={isDisabled}
              disabled={isDisabled}
              important
              large
            >
              {this.props.isRestoring ? t(`Next`) : t(`Submit`)}
            </RoundedButton>

          </RoundedForm>

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

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(EnterSeed))
