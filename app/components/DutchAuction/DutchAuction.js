// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'

import { ResDexLoginActions } from '~/reducers/resdex/login/reducer'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'

import styles from './DutchAuction.scss'

type Props = {
  t: any,
  resDex: ResDexState,
  actions: object
}

/**
 * @class DutchAuction
 * @extends {Component<Props>}
 */
export class DutchAuction extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof DutchAuction
	 */
	render() {
    const { t } = this.props

    return (
      <div className={styles.container}>
        <DutchAuction />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  resDex: state.resDex,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexLoginActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(DutchAuction))
