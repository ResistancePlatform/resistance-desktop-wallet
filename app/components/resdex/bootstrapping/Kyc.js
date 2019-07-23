// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next'
import { remote } from 'electron'
import { Webview } from '~/components/Webview/Webview'
import { toastr } from 'react-redux-toastr'
import request from 'request-promise'
import log from 'electron-log'

import { resDexApiFactory } from '~/service/resdex/api'
import { ResDexLoginActions } from '~/reducers/resdex/login/reducer'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'

import styles from './Kyc.scss'

const kycUrl = 'https://kvk0a65tl4.execute-api.us-east-1.amazonaws.com/api'
// const kycUrl = 'https://regtech.identitymind.store/viewform/vs33y/'
const kycApiUrl = 'https://kvk0a65tl4.execute-api.us-east-1.amazonaws.com'

type Props = {
  t: any,
  resDex: ResDexState,
  actions: object
}

/**
 * @class Kyc
 * @extends {Component<Props>}
 */
export class Kyc extends Component<Props> {
	props: Props

	/**
	 * @memberof Kyc
	 */
	componentDidMount() {
    const { t } = this.props
    const { defaultPortfolioId } = this.props.resDex.login
    const currentWindow = remote.getCurrentWindow()

    log.debug(`Creating web hook`)

    currentWindow.webContents.session.webRequest.onBeforeRequest({}, async (details, callback) => {

      if (details.method === 'POST' && details.url.endsWith('/api/v1/idmwebhook')) {
        log.debug(`Web hook:`, details)

        const ca = JSON.parse(details.uploadData[0].bytes.toString('utf8')).jwtresponse
        const base64Data = ca.split('.')[1]
        const buffer = Buffer.from(base64Data, 'base64')
        const text = buffer.toString('ascii')
        const result = JSON.parse(text)

        log.debug(`Got KYC secret:`, result.tid)

        const isRegistered = await this.generateAndSendRegister(result.tid)

        if (!isRegistered) {
          toastr.error(t(`Error submitting verification form, please make sure your Internet connection is good or check the log for details.`))
        } else {
          this.props.actions.updatePortfolio(defaultPortfolioId, { isVerified: true })
          toastr.success(t(`You have successfully passed verification!`))
        }

        callback({ cancel: true })
      } else {
        callback({ cancel: false })
      }
    })
  }

	/**
	 * @memberof Kyc
	 */
	componentWillUnmount() {
    const currentWindow = remote.getCurrentWindow()
    currentWindow.webContents.session.webRequest.onBeforeRequest({}, null)
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
   * @memberof Kyc
	 */
	render() {
    const { t } = this.props

    return (
      <div className={styles.container}>
        <div className={styles.title}>
          {t(`Get Verified`)}
        </div>
        <Webview
          className={styles.webview}
          title={t(`Get Verified`)}
          url={kycUrl}
        />
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

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(Kyc))
