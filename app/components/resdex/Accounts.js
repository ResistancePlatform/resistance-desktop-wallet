// @flow
import React, { Component } from 'react'
import cn from 'classnames'
import { translate } from 'react-i18next'

import styles from './ResDex.scss'

type Props = {
  t: any
}


/**
 * @class ResDexAccounts
 * @extends {Component<Props>}
 */
class ResDexAccounts extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof ResDexAccounts
	 */
	render() {
    const { t } = this.props

		return (
      <div className={cn(styles.assetsContainer)}>
        Accounts
      </div>
    )
  }
}

export default translate('resdex')(ResDexAccounts)
