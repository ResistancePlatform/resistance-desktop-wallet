// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { remote } from 'electron'
import { Webview } from '~/components/Webview/Webview'
import cn from 'classnames'
import log from 'electron-log'

import { translate } from '~/i18next.config'
import { KycActions } from '~/reducers/kyc/kyc.reducer'

import styles from './Kyc.scss'

type Props = {
  className?: string,
  url: string,
  submitCallback?: func,
  actions: object
}

const t = translate('service')

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
    const { submitCallback } = this.props
    const currentWindow = remote.getCurrentWindow()

    log.debug(`Creating web hook`)

    currentWindow.webContents.session.webRequest.onBeforeRequest({}, async (details, callback) => {
      if (details.url.includes('/api/v1/idmwebhook')) {
        log.debug(`Details:`, details)
      }

      if (details.method === 'POST' && details.url.endsWith('/api/v1/idmwebhook')) {
        log.debug(`Web hook:`, details)

        const ca = JSON.parse(details.uploadData[0].bytes.toString('utf8')).jwtresponse
        const base64Data = ca.split('.')[1]
        const buffer = Buffer.from(base64Data, 'base64')
        const text = buffer.toString('ascii')
        const result = JSON.parse(text)

        log.debug(`Got KYC data:`, JSON.stringify(result))

        const kycData = {
          tid: result.tid,
          email: result.form_data.email,
          phone: result.form_data.phone,
        }

        this.props.actions.update(kycData.tid, kycData.email)

        if (submitCallback) {
          submitCallback(kycData)
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

	/**
	 * @returns
   * @memberof Kyc
	 */
	render() {
    const { url } = this.props

    return (
      <div className={cn(styles.container, this.props.className)}>
        <Webview
          className={styles.webview}
          title={t(`Get Verified`)}
          url={url}
        />
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(KycActions, dispatch),
})

export default connect(null, mapDispatchToProps)(Kyc)
