// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'

import FetchParametersState from '~/reducers/fetch-parameters/fetch-parameters.reducer'

import styles from './FetchParametersProgress.scss'

type Props = {
  t: any,
  fetchParameters: FetchParametersState
}

class FetchParametersProgress extends Component<Props> {
	props: Props

	/**
	 * @memberof FetchParametersProgress
	 */
	render() {
    const { t } = this.props

		return (
			<div className={styles.container}>
        <div className={styles.nothing}>
          {t(``)}
        </div>
        <div className={styles.progressBar}>
          <div style={{ width: `${this.props.fetchParameters.progressRate}%` }} />
        </div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	fetchParameters: state.fetchParameters
})

export default connect(mapStateToProps, null)(translate('other')(FetchParametersProgress))
