// @flow
import React, { Component } from 'react'
import { v4 as uuid } from 'uuid'
import ReactTooltip from 'react-tooltip'
import cn from 'classnames'

import styles from './UniformList.scss'
import tooltipStyles from '~/assets/styles/tooltip.scss'

type Props = {
  className?: string,
  width?: string,
  children?: any,
  tooltip?: string | null,
  tooltipClassName?: string
}

export default class UniformListColumn extends Component<Props> {
	props: Props

  static get displayName() { return 'UniformListColumn' }

  constructor(props) {
    super(props)
    this.tooltipId = `tooltip-${uuid()}`
  }

	/**
	 * @memberof UniformListColumn
	 */
  render() {
    return (
      <React.Fragment>
        <div
          className={cn(styles.column, this.props.className)}
          style={{ width: this.props.width }}
          data-tip={this.props.tooltip || true} data-for={this.tooltipId}
        >
          {this.props.children}
        </div>

        {this.props.tooltip &&
          <ReactTooltip id={this.tooltipId} className={cn(tooltipStyles.tooltip, this.props.tooltipClassName)}>
            {this.props.tooltip}
          </ReactTooltip>
        }
      </React.Fragment>
    )
  }

}
