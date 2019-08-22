// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'

import { Kyc } from '~/components/Kyc/Kyc'
import { ResDexLoginActions } from '~/reducers/resdex/login/reducer'

const kycUrl = 'https://kvk0a65tl4.execute-api.us-east-1.amazonaws.com/api'
// const kycUrl = 'https://regtech.identitymind.store/viewform/vs33y/'

type Props = {}

/**
 * @class ResDexKyc
 * @extends {Component<Props>}
 */
export class ResDexKyc extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof ResDexKyc
	 */
	render() {
    return (
      <Kyc url={kycUrl} />
    )
  }
}

const mapStateToProps = state => ({
  resDex: state.resDex,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexLoginActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ResDexKyc))
