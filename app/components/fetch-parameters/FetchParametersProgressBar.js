// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'

import FetchParametersState from '~/reducers/fetch-parameters/fetch-parameters.reducer'

import styles from './FetchParametersProgressBar.scss'

type Props = {
  t: any,
  fetchParameters: FetchParametersState
}

class FetchParametersProgressBar extends Component<Props> {
	props: Props

	/**
	 * @memberof FetchParametersProgressBar
	 */
	render() {
    const { t } = this.props

		return (
			<div className={styles.container}>
        <div className={styles.nothing}>
          {t(``)}
        </div>
        <div className={styles.progressBar} title={this.props.fetchParameters.statusMessage}>
          <div style={{ width: `${this.props.fetchParameters.progressRate}%` }} />
        </div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	fetchParameters: state.fetchParameters
})

export default connect(mapStateToProps, null)(translate('other')(FetchParametersProgressBar))
