// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import cn from 'classnames'

import { ResDexBootstrappingActions } from '~/reducers/resdex/bootstrapping/reducer'
import {
  RoundedButton,
} from '~/components/rounded-form'
import Logo from '../Logo'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './Start.scss'


type Props = {
  t: any,
  actions: object
}

/**
 * @class Start
 * @extends {Component<Props>}
 */
class Start extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof Start
	 */
	render() {
    const { t } = this.props

    return (
      <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, styles.wrapper)}>
        <div className={cn(styles.container, HLayout.hBoxChild, VLayout.vBoxContainer)}>
          <Logo />

          <div className={styles.header}>
            {t(`Would you like to create a new portfolio or restore an existing one?`)}
          </div>

          <div className={styles.explanation}>
            {t(`Create a new one if you don't have a seed phrase yet.`)}
          </div>

          <div className={styles.buttonsContainer}>
            <RoundedButton
              className={styles.button}
              onClick={this.props.actions.startRestoringPortfolio}
              large
            >
              {t(`Restore portfolio`)}
            </RoundedButton>

            <RoundedButton
              className={styles.button}
              onClick={this.props.actions.startCreatingPortfolio}
              important
              large
            >
              {t(`Create new portfolio`)}
            </RoundedButton>

          </div>

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
  actions: bindActionCreators(ResDexBootstrappingActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(Start))
