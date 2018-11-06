// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import * as Joi from 'joi'
import cn from 'classnames'
import { routerActions } from 'react-router-redux'

import { getIsLoginDisabled } from '~/utils/resdex'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexBootstrappingActions } from '~/reducers/resdex/bootstrapping/reducer'
import {
  RoundedForm,
  RoundedButton,
  RoundedTextArea,
} from '~/components/rounded-form'
import Logo from '../Logo'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './EnterSeed.scss'

const getValidationSchema = t => (
  Joi.object().keys({
    seedPhrase: Joi.string().required().label(t(`Seed phrase`)),
  })
)

type Props = {
  t: any,
  resDex: ResDexState,
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
	 * @returns
   * @memberof EnterSeed
	 */
	render() {
    const { t } = this.props
    const isDisabled = getIsLoginDisabled(this.props)
    const { isRestoring } = this.props.resDex.bootstrapping

    return (
      <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, styles.wrapper)}>
        <div className={cn(styles.container, HLayout.hBoxChild, VLayout.vBoxContainer)}>
          <Logo />

          <div className={styles.header}>
            {isRestoring ? t(`Enter your seed phrase`) : t(`Confirm your seed phrase`)}
          </div>

          <RoundedForm
            id="resDexEnterSeedPhrase"
            schema={getValidationSchema(t)}
            className={styles.form}
          >

            <RoundedTextArea
              name="seedPhrase"
              rows={4}
              placeholder={t(`Example: advanced generous profound...`)}
            />

            <div className={styles.buttonsContainer}>
              <RoundedButton
                className={styles.button}
                onClick={() => (
                  isRestoring
                    ? this.props.routerActions.push('/resdex/start')
                    : this.props.routerActions.push('/resdex/save-seed')
                )}
                large
              >
                {t(`Back`)}
              </RoundedButton>
              <RoundedButton
                type="submit"
                className={styles.submitButton}
                onClick={() => (
                  isRestoring
                    ? this.props.routerActions.push('/resdex/create-portfolio')
                    : this.props.actions.createPortfolio()
                )}
                spinner={isDisabled}
                disabled={isDisabled}
                important
                large
              >
                {isRestoring ? t(`Next`) : t(`Submit`)}
              </RoundedButton>

              </div>

          </RoundedForm>

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

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(EnterSeed))
