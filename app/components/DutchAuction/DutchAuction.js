// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'

import { DutchAuctionActions } from '~/reducers/dutch-auction/dutch-auction.reducer'
import { DutchAuctionState } from '~/reducers/dutch-auction/dutch-auction.epic'

import styles from './DutchAuction.scss'

type Props = {
  t: any,
  dutchAuction: DutchAuctionState,
  actions: object
}

/**
 * @class DutchAuction
 * @extends {Component<Props>}
 */
export class DutchAuction extends Component<Props> {
	props: Props

	/**
	 * @memberof DutchAuction
	 */
  componentDidMount() {
    this.props.actions.getAuctionStatus()
  }

	/**
	 * @returns
   * @memberof DutchAuction
	 */
	render() {
    const { t } = this.props
    const { status } = this.props.dutchAuction

    return (
      <div className={styles.container}>
        {status.status || t(`N/A`)}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  dutchAuction: state.dutchAuction,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(DutchAuctionActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(DutchAuction))
