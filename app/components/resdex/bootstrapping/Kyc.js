// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import { toastr } from 'react-redux-toastr'
import request from 'request-promise'
import log from 'electron-log'

import { Kyc } from '~/components/Kyc/Kyc'
import { resDexApiFactory } from '~/service/resdex/api'
import { ResDexLoginActions } from '~/reducers/resdex/login/reducer'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'

const kycUrl = 'https://kvk0a65tl4.execute-api.us-east-1.amazonaws.com/api'
// const kycUrl = 'https://regtech.identitymind.store/viewform/vs33y/'
const kycApiUrl = 'https://kvk0a65tl4.execute-api.us-east-1.amazonaws.com'

type Props = {
  t: any,
  resDex: ResDexState,
  actions: object
}

/**
 * @class ResDexKyc
 * @extends {Component<Props>}
 */
export class ResDexKyc extends Component<Props> {
	props: Props

  async register(data) {
    const { tid } = data
    const { t } = this.props
    const { defaultPortfolioId } = this.props.resDex.login
    const isRegistered = await this.generateAndSendRegister(tid)

    if (!isRegistered) {
      toastr.error(t(`Error submitting verification form, please make sure your Internet connection is good or check the log for details.`))
    } else {
      this.props.actions.updatePortfolio(defaultPortfolioId, { isVerified: true, tid })
      toastr.success(t(`You have successfully passed verification!`))
    }
  }

  async generateAndSendRegister(tid: string): boolean {
    const resDexApi = resDexApiFactory('RESDEX')

    const payload = await resDexApi.signKycMessage({ tid })
    log.debug(`Submitting KYC ID to ResDEX:`, tid)
    log.debug(`Got KYC registration payload:`, payload)

    try {
      const result = await this.post(`${kycApiUrl}/api/v1/register`, payload)
      log.debug(`Register result`, typeof result, result)
      return typeof result === "string" && result.includes(' VALID KYC')
    } catch (err) {
      log.error(`Can't submit verification form:`, err)
      return false
    }
  }

  async post(url, jsonData) {
    const result = await request({
      url,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(jsonData)
    })
    return result
  }

	/**
	 * @returns
   * @memberof ResDexKyc
	 */
	render() {
    return (
      <Kyc
        url={kycUrl}
        submitCallback={data => this.register(data)}
      />
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
