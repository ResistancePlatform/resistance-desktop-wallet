// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import { shell } from 'electron'

import {
  RoundedButton,
} from '~/components/rounded-form'
import { SystemInfoActions, SystemInfoState } from '~/reducers/system-info/system-info.reducer'

import styles from './UpdateModal.scss'

type Props = {
  t: any,
	systemInfo: SystemInfoState,
  actions: object
}

/**
 * @class UpdateModal
 * @extends {Component<Props>}
 */
class UpdateModal extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props
    const { versionName, downloadUrl } = this.props.systemInfo.updateModal
    const version = versionName.split(' ').pop()

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.update)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeUpdateModal}
            onKeyDown={() => {}}
          />

          {/* Title */}
          <div className={styles.title}>
            {t(`Update Resistance Wallet`)}
          </div>

          <div className={styles.body}>
            <div className={styles.note}>
              <strong>{t(`Important:`)}</strong>
              {t(`Version {{version}} of Resistance Wallet available. Please follow the link below to update your desktop application. It is important that you keep your app up to date to ensure you benefit from all relevant bug fixes and improvements, failure to do so could result in operating errors.`, {version})}
            </div>

            <RoundedButton
              className={styles.button}
              onClick={() => shell.openExternal(downloadUrl)}
              small
              important
            >
              {t(`Open release download page`)}
            </RoundedButton>

          </div>

        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
	systemInfo: state.systemInfo,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(SystemInfoActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('other')(UpdateModal))
