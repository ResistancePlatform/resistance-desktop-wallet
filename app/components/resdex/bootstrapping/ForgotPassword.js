// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import cn from 'classnames'

import { ResDexBootstrappingActions } from '~/reducers/resdex/bootstrapping/reducer'

import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './ForgotPassword.scss'

type Props = {
  t: any
}

/**
 * @class ForgotPassword
 * @extends {Component<Props>}
 */
class ForgotPassword extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof ForgotPassword
	 */
	render() {
    const { t } = this.props
    return (
      <div className={cn(styles.container, HLayout.hBoxChild, VLayout.vBoxContainer)}>
        <div className={styles.header}>
          {t(`Restore your password`)}
        </div>
      </div>
    )
  }

}

const mapStateToProps = state => ({
  resDex: state.resDex,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexBootstrappingActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ForgotPassword))
