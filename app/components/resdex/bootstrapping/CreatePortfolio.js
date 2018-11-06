// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import * as Joi from 'joi'
import cn from 'classnames'
import { routerActions } from 'react-router-redux'

import { getPasswordValidationSchema } from '~/utils/auth'
import { getIsLoginDisabled } from '~/utils/resdex'
import {
  RoundedForm,
  RoundedButton,
  RoundedInput,
} from '~/components/rounded-form'
import Logo from '../Logo'
import { ResDexBootstrappingActions } from '~/reducers/resdex/bootstrapping/reducer'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from '../Login.scss'

const getValidationSchema = t => (
  Joi.object().keys({
    name: Joi.string().required().max(32).label(t(`Portfolio name`)),
    resDexPassword: getPasswordValidationSchema().label(`ResDEX password`),
    confirmResDexPassword: (
      Joi.string().required().valid(Joi.ref('resDexPassword'))
      .label(t(`Confirm ResDEX password`))
      .options({
        language: {
          any: { allowOnly: `!!${t('Passwords do not match')}`, }
        }
      })
    ),
    walletPassword: getPasswordValidationSchema().label(`Wallet password`),
  })
)

type Props = {
  t: any,
  resDex: object,
  actions: object,
  routerActions: object
}

/**
 * @class CreatePortfolio
 * @extends {Component<Props>}
 */
class CreatePortfolio extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof CreatePortfolio
	 */
	render() {
    const { t } = this.props
    const { isRestoring } = this.props.resDex.bootstrapping
    const isDisabled = getIsLoginDisabled(this.props)

    return (
      <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, styles.wrapper)}>
        <div className={cn(styles.container, HLayout.hBoxChild, VLayout.vBoxContainer)}>
          <Logo />

          <RoundedForm id="resDexCreatePortfolio" schema={getValidationSchema(t)} className={styles.form}>
            <RoundedInput
              name="name"
              placeholder={t(`Portfolio name`)}
              large
            />

            <RoundedInput
              name="resDexPassword"
              type="password"
              placeholder={t(`ResDEX password`)}
              large
            />

            <RoundedInput
              name="confirmResDexPassword"
              type="password"
              placeholder={t(`Confirm password`)}
              large
            />

            <RoundedInput
              name="walletPassword"
              type="password"
              placeholder={t(`Wallet password`)}
              large
            />

            <div className={styles.buttonsContainer}>
              <RoundedButton
                className={styles.button}
                onClick={() => (
                  isRestoring
                  ? this.props.routerActions.push('/resdex/restore-portfolio')
                  : this.props.routerActions.push('/resdex/start')
                )}
                large
              >
                {t(`Back`)}
              </RoundedButton>

              {isRestoring
                ? (
                 <RoundedButton
                    type="submit"
                    onClick={this.props.actions.createPortfolio}
                    spinner={isDisabled}
                    disabled={isDisabled}
                    important
                    large
                  >
                    {t(`Submit`)}
                  </RoundedButton>
                ) : (
                  <RoundedButton
                    className={styles.button}
                    onClick={() => this.props.routerActions.push('/resdex/save-seed')}
                    important
                    large
                  >
                    {t(`Next`)}
                  </RoundedButton>
                )
              }
            </div>

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
  settings: state.settings
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexBootstrappingActions, dispatch),
  routerActions: bindActionCreators(routerActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(CreatePortfolio))
