// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'

import styles from './FetchParametersProgress.scss'

type Props = {
  t: any,
  getStarted: GetStartedState
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
        {t(``)}
        {this.props.getStarted}
			</div>
		)
	}
}

export default translate('get-started')(FetchParametersProgress)

