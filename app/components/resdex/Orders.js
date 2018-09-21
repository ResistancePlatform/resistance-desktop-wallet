// @flow
import React, { Component } from 'react'
import cn from 'classnames'
import { translate } from 'react-i18next'

import styles from './ResDex.scss'

type Props = {
}


/**
 * @class ResDexOrders
 * @extends {Component<Props>}
 */
class ResDexOrders extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof ResDexOrders
	 */
	render() {
		return (
      <div className={cn(styles.assetsContainer)}>
        ResDexOrders
      </div>
    )
  }
}

export default translate('resdex')(ResDexOrders)
