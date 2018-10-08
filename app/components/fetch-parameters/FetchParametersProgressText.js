// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'

import FetchParametersState from '~/reducers/fetch-parameters/fetch-parameters.reducer'

import styles from './FetchParametersProgressText.scss'

type Props = {
  t: any,
  fetchParameters: FetchParametersState
}

class FetchParametersProgressText extends Component<Props> {
	props: Props

	/**
	 * @memberof FetchParametersProgressText
	 */
	render() {
    const { t } = this.props

    const text = t(`Please wait for Resistance parameters download to complete`)

		return (
      <div className={styles.container} title={this.props.fetchParameters.statusMessage}>
        <div className={styles.progress}>
          {text}
          <div style={{ width: `${this.props.fetchParameters.progressRate}%` }}>
            {text}
          </div>
        </div>
      </div>
		)
	}
}

const mapStateToProps = state => ({
	fetchParameters: state.fetchParameters
})

export default connect(mapStateToProps, null)(translate('other')(FetchParametersProgressText))
