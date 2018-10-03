// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'

import styles from './FetchParametersFooter.scss'

type Props = {
  t: any,
  getStarted: GetStartedState
}

class FetchParametersFooter extends Component<Props> {
	props: Props

	/**
	 * @memberof FetchParametersFooter
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

export default translate('get-started')(FetchParametersFooter)

