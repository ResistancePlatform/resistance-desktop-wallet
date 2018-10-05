// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'

import { NaviState } from '~/reducers/navi/navi.reducer'
import FetchParametersState from '~/reducers/fetch-parameters/fetch-parameters.reducer'
import FetchParametersProgressBar from '~/components/fetch-parameters/FetchParametersProgressBar'

import styles from './Footer.scss'

type Props = {
  t: any,
  fetchParameters: FetchParametersState,
	navi: NaviState
}

class Footer extends Component<Props> {
	props: Props

	/**
	 * @memberof Footer
	 */
	render() {
    const { t } = this.props

		return (
			<div className={styles.container}>
        {t(``)}

        {!this.props.fetchParameters.isDownloadComplete && !this.props.navi.currentNaviPath.includes('/welcome') &&
          <FetchParametersProgressBar className={styles.progressBar} />
        }
			</div>
		)
	}
}

const mapStateToProps = state => ({
	fetchParameters: state.fetchParameters,
	navi: state.navi
})

export default connect(mapStateToProps, null)(translate('get-started')(Footer))
