// @flow
import React, { Component } from 'react'
import cn from 'classnames'

import styles from './ResDex.scss'

type Props = {
}


/**
 * @class Assets
 * @extends {Component<Props>}
 */
export class Assets extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof Assets
	 */
	render() {
		return (
      <div className={cn(styles.assetsContainer)}>
        Assets
      </div>
    )
  }
}

