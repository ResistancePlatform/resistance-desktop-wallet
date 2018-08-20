// @flow
import React, { Component } from 'react'
import styles from './popup-menu.scss'

type Props = {
  isVisible: boolean
}

type State = {
  left: number,
  top: number
}

export default class PopupMenu extends Component<Props> {
	props: Props
  state: State

  static propTypes = {
    id: PropTypes.string.isRequired,
    children: React.PropTypes.node.isRequired
  }

	render() {
		const containerStyles = {
			display: this.props.isVisible ? 'block' : 'none',
			top: this.state.top,
			left: this.state.left
		}

		return (
			<div
				className={styles.popupMenuContainer}
				style={containerStyles}
			>
        {this.props.children}
			</div>
		)
	}
}
