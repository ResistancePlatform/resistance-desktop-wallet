import { v4 as uuid } from 'uuid'
import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip'
import cn from 'classnames'

import styles from './Info.scss'


export type InfoProps = {
  tooltipClassName?: string,
  tooltip?: string,
	children: any
}

export default class Info extends Component<Props> {
  props: InfoProps
  tooltipId: string

  constructor(props) {
    super(props)
    this.tooltipId = `tooltip-${uuid()}`
  }

  render() {
    return (
      <div className={styles.container}>
        <i className={styles.info} data-tip={this.props.tooltip || true} data-for={this.tooltipId} />

        <ReactTooltip id={this.tooltipId} className={cn(styles.tooltip, this.props.tooltipClassName)}>
          {this.props.children && this.props.children}
        </ReactTooltip>
      </div>
    )
  }
}
