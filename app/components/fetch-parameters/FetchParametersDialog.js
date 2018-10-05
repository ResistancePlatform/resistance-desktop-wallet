// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'
import cn from 'classnames'

import FetchParametersProgressText from '~/components/fetch-parameters/FetchParametersProgressText'

import resistanceLogo from '~/assets/images/logo.svg'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'
import styles from './FetchParametersDialog.scss'

type Props = {
  t: any
}

class FetchParametersDialog extends Component<Props> {
	props: Props

	/**
	 * @memberof FetchParametersDialog
	 */
	render() {
    const { t } = this.props

		return (
      <div className={cn(styles.container, HLayout.hBoxChild, VLayout.vBoxContainer)}>
        <div className={cn(styles.header)}>
          {t(``)}
          <img src={resistanceLogo} alt="Resistance" />
          Resistance
        </div>

        <FetchParametersProgressText />
      </div>
		)
	}
}

const mapStateToProps = state => ({
	fetchParameters: state.fetchParameters
})

export default connect(mapStateToProps, null)(translate('other')(FetchParametersDialog))
