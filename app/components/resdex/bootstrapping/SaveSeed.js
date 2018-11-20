// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import cn from 'classnames'
import { routerActions } from 'react-router-redux'

import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexBootstrappingActions } from '~/reducers/resdex/bootstrapping/reducer'
import {
  RoundedButton,
} from '~/components/rounded-form'
import Logo from '../Logo'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './SaveSeed.scss'


type Props = {
  t: any,
  resDex: ResDexState,
  actions: object,
  routerActions: object
}

/**
 * @class SaveSeed
 * @extends {Component<Props>}
 */
class SaveSeed extends Component<Props> {
	props: Props

	/**
	 * @memberof SaveSeed
	 */
	componentDidMount() {
    const { generatedSeedPhrase } = this.props.resDex.bootstrapping
    if (generatedSeedPhrase === null) {
      this.props.actions.generateSeedPhrase()
    }
  }

	/**
	 * @returns
   * @memberof SaveSeed
	 */
	render() {
    const { t } = this.props

    return (
      <div className={cn(HLayout.hBoxChild, VLayout.vBoxContainer, styles.wrapper)}>
        <div className={cn(styles.container, HLayout.hBoxChild, VLayout.vBoxContainer)}>
          <Logo />

          <div className={styles.header}>
            {t(`Seed phrase for your portfolio`)}
          </div>

          <div className={styles.seedPhraseContainer}>
            {this.props.resDex.bootstrapping.generatedSeedPhrase}

            <div className={styles.buttonsContainer}>
              <RoundedButton
                className={cn(styles.button, styles.copy)}
                onClick={this.props.actions.copySeedPhrase}
              >
                <div className={cn('icon', styles.icon, styles.copy)} />
                {t(`Copy to clipboard`)}
              </RoundedButton>

              <RoundedButton
                className={cn(styles.button, styles.generate)}
                onClick={this.props.actions.generateSeedPhrase}
                important>
                <div className={cn('icon', styles.icon, styles.generate)} />
                {t(`Generate new`)}
              </RoundedButton>
            </div>

          </div>

          <div className={styles.warningContainer}>
            <div className={styles.exclamation} />

            <div className={styles.warning}>
              <div className={styles.important}>
                {t(`Important! Please back up your seed immediately!`)}
              </div>

              <div className={styles.recommendation}>
                {t(`We recommend storing it offline.`)} &nbsp;

                <a
                  role="link"
                  tabIndex={0}
                  onClick={this.props.actions.learnAboutSeedPhrase}
                  onKeyDown={() => false}
                >
                  {t(`Learn more about it`)}
                </a>

              </div>
            </div>

          </div>

          <div className={styles.buttonsContainer}>
            <RoundedButton
              className={styles.button}
              onClick={() => this.props.routerActions.push('/resdex/create-portfolio')}
              large
            >
              {t(`Back`)}
            </RoundedButton>

            <RoundedButton
              type="submit"
              className={styles.button}
              onClick={() => this.props.routerActions.push('/resdex/confirm-seed')}
              important
              large
            >
              {t(`Next`)}
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
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexBootstrappingActions, dispatch),
  routerActions: bindActionCreators(routerActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(SaveSeed))
