// @flow
import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'

import { PopupMenuState } from '../../state/reducers/popup-menu/popup-menu.reducer'

import styles from './popup-menu.scss'

type Props = {
  id: string,
  popupMenu: PopupMenuState
}

class PopupMenu extends Component<Props> {
	props: Props

  static propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
  }

  renderChildren() {
    const props = this.props.popupMenu[this.props.id]

    return React.Children.map(this.props.children, child => React.cloneElement(child, {
      id: this.props.id,
      data: props.data
    }))
  }

	render() {
    const props = this.props.popupMenu[this.props.id]

    if (!props) {
      return null
    }

		const containerStyles = {
			display: props.isVisible ? 'block' : 'none',
			top: props.top,
			left: props.left
		}

		return (
			<div
				className={styles.popupMenuContainer}
				style={containerStyles}
			>
        {this.renderChildren()}
			</div>
		)
	}
}

const mapStateToProps = state => ({
	popupMenu: state.popupMenu,
})

export default connect(mapStateToProps, null)(PopupMenu)
