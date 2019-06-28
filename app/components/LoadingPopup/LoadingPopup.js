// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'

import { LoadingPopupState } from '~/reducers/loading-popup/loading-popup.reducer'

import resistanceLogo from '~/assets/images/logo.svg'
import styles from './LoadingPopup.scss'

type Props = {
  t: any,
  loadingPopup: LoadingPopupState
}

/**
 * @class LoadingPopup
 * @extends {Component<Props>}
 */
class LoadingPopup extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props
    const { isVisible, message } = this.props.loadingPopup

    if (!isVisible) {
      return null
    }

    return (
      <div className={styles.overlay}>
        <div className={styles.container}>

          <img src={resistanceLogo} alt="Resistance" />

          <div className={styles.title}>
            {t(`Please wait`)}
          </div>

          <div className={styles.body}>
            {message}
          </div>
      </div>
    </div>
    )
  }
}

const mapStateToProps = (state) => ({
	loadingPopup: state.loadingPopup
})

export default connect(mapStateToProps, null)(translate('other')(LoadingPopup))
