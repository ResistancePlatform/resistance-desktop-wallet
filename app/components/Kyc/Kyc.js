// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { remote } from 'electron'
import { Webview } from '~/components/Webview/Webview'
import log from 'electron-log'

import { translate } from '~/i18next.config'

import styles from './Kyc.scss'

type Props = {
  url: string,
  submitCallback: func
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

      if (details.method === 'POST' && details.url.endsWith('/api/v1/idmwebhook')) {
        log.debug(`Web hook:`, details)

        const ca = JSON.parse(details.uploadData[0].bytes.toString('utf8')).jwtresponse
        const base64Data = ca.split('.')[1]
        const buffer = Buffer.from(base64Data, 'base64')
        const text = buffer.toString('ascii')
        const result = JSON.parse(text)

        log.debug(`Got KYC tid:`, result.tid, `email:`, result.email)

        submitCallback(result.tid, result.email)

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
      <div className={styles.container}>
        <div className={styles.title}>
          {t(`Get Verified`)}
        </div>
        <Webview
          className={styles.webview}
          title={t(`Get Verified`)}
          url={url}
        />
      </div>
    )
  }
}

export default connect(null, null)(translate('resdex')(Kyc))
