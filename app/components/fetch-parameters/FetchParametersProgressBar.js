// @flow
import moment from 'moment'
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'

import FetchParametersState from '~/reducers/fetch-parameters/fetch-parameters.reducer'

import styles from './FetchParametersProgressBar.scss'

type Props = {
  t: any,
  i18n: any,
  fetchParameters: FetchParametersState
}

class FetchParametersProgressBar extends Component<Props> {
	props: Props

	/**
	 * @memberof FetchParametersProgressBar
	 */
	render() {
    const { t, i18n } = this.props
    const {
      minutesLeft,
      progressRate,
      statusMessage,
      isDownloadComplete
    } = this.props.fetchParameters

    const timeLeft = minutesLeft
      ? moment.duration(minutesLeft, 'minutes')
      : null

    const isDownloading = !isDownloadComplete && progressRate < 100

		return (
			<div className={styles.container}>

        {isDownloading &&
          <div className={styles.caption}>
            {statusMessage}
          </div>
        }

        {isDownloading &&
          <div className={styles.status}>
            <strong>{Math.round(progressRate)}%</strong>
            {timeLeft && t(`({{time}} left)`, {time: timeLeft.locale(i18n.language).humanize()})}
          </div>
        }

        <div className={styles.progressBar}>
          <div style={{ width: `${progressRate}%` }} />
        </div>

			</div>
		)
	}
}

const mapStateToProps = state => ({
	fetchParameters: state.fetchParameters
})

export default connect(mapStateToProps, null)(translate('other')(FetchParametersProgressBar))
