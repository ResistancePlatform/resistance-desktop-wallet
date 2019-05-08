// @flow
import { v4 as uuid } from 'uuid'
import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import cn from 'classnames'
import { bindActionCreators } from 'redux'
import ReactTooltip from 'react-tooltip'

import { PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'

import styles from './popup-menu.scss'

type Props = {
  id: string,
  className?: string,
  data: any,
  disabled?: boolean,
  tooltipClassName?: string,
  tooltip?: string,
  onClick: func,
  actions: any
}

class PopupMenuItem extends Component<Props> {
	props: Props
  state: State
  tooltipId: string

  static propTypes = {
    children: PropTypes.node.isRequired
  }

  constructor(props) {
    super(props)
    this.tooltipId = `tooltip-${uuid()}`
  }

  handleClick(event) {
    event.stopPropagation()

    if (this.props.disabled) {
      return false
    }

    this.props.onClick(event, this.props.data)
		this.props.actions.hide(this.props.id)
    return false
  }

	render() {
		return (
      <div
        role="none"
        className={cn(styles.menuItem, this.props.className)}
        onClick={(e) => this.handleClick(e)}
        onKeyDown={(e) => this.handleClick(e)}
        data-tip={this.props.tooltip || true}
        data-for={this.tooltipId}
      >
        <div className={cn({ [styles.disabled]: this.props.disabled })}>
          {this.props.children}
        </div>

        {this.props.tooltip &&
          <ReactTooltip id={this.tooltipId} className={cn(styles.tooltip, this.props.tooltipClassName)}>
            {this.props.tooltip}
          </ReactTooltip>
        }
      </div>
		)
	}
}

const mapStateToProps = state => ({
	popupMenu: state.popupMenu,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(PopupMenuActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(PopupMenuItem)
