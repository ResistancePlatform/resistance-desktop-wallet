// @flow
import React, { Component } from 'react'
import styles from './popup-menu.scss'

type Props = {
  onClick: func
}

export class PopupMenuItem extends Component<Props> {
	props: Props
  state: State

  static propTypes = {
    children: React.PropTypes.node.isRequired
  }

  handleClick() {
    this.props.onClick()
    return false
  }

	render() {
		return (
      <div
        className={styles.menuItem}
        onClick={() => this.handleClick()}
        onKeyDown={() => this.handleClick()}
      >
        {this.props.children}
      </div>
		)
	}
}

