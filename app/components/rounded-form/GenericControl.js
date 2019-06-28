import log from 'electron-log'
import { v4 as uuid } from 'uuid'
import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip'
import cn from 'classnames'

import genericStyles from './GenericControl.scss'
import tooltipStyles from '~/assets/styles/tooltip.scss'


export type GenericProps = {
  className?: string,
	disabled?: boolean,
  tooltip?: string | null,
  tooltipClassName?: string
}

export default class GenericControl extends Component<Props> {
  props: Props

  static get isRoundedFormComponent() { return true }

  constructor(props) {
    super(props)
    this.tooltipId = `tooltip-${uuid()}`
  }

  renderControl() {
    log.error(`Generic control cannot be used directly and should be inherited`)
    return null
  }

	render() {
		return (
      <React.Fragment>
        <div
          className={cn(genericStyles.control, {
            [genericStyles.disabled]: this.props.disabled,
          })}
          data-tip={this.props.tooltip || true} data-for={this.tooltipId}
        >
          {this.renderControl()}
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
