// @flow
import React, { Component } from 'react'
import classNames from 'classnames'

import styles from './UniformList.scss'

type Props = {
  className?: string,
  width?: string,
  children?: any
}

export default class UniformListColumn extends Component<Props> {
	props: Props

	/**
	 * @memberof UniformListColumn
	 */
  render() {
    return (
      <div className={classNames(styles.column, this.props.className)} style={{ width: this.props.width }}>
        {this.props.children}
      </div>
    )
  }

}
