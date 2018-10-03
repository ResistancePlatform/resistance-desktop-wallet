// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'

import FetchParametersState from '~/reducers/fetch-parameters/fetch-parameters.reducer'
import FetchParametersProgress from '~/components/fetch-parameters/FetchParametersProgress'
import styles from './Footer.scss'

type Props = {
  t: any,
  fetchParameters: FetchParametersState
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

        {!this.props.fetchParameters.isDownloadComplete &&
          <FetchParametersProgress className={styles.progressBar} />
        }
			</div>
		)
	}
}

const mapStateToProps = state => ({
	fetchParameters: state.fetchParameters
})

export default connect(mapStateToProps, null)(translate('get-started')(Footer))
