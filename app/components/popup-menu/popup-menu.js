// @flow
import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'

import { appStore } from '~/state/store/configureStore'
import { PopupMenuState, PopupMenuActions } from '~/state/reducers/popup-menu/popup-menu.reducer'

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

	/**
	 * @memberof PopupMenu
	 */
	componentDidMount() {
    document.addEventListener('mousedown', e => this.handleOutsideClick(e))
  }

	/**
	 * @memberof PopupMenu
	 */
	componentWillUnmount() {
    document.removeEventListener('mousedown', e => this.handleOutsideClick(e))
	}

  handleOutsideClick(event) {
    if (!this.element) {
      return
    }

    const props = this.props.popupMenu[this.props.id]

    if (props && props.isVisible && !this.element.contains(event.target)) {
      appStore.dispatch(PopupMenuActions.hide(this.props.id))
    }
  }

	/**
	 * @memberof PopupMenu
	 */
  elementRef(element) {
    this.element = element
  }

	/**
	 * @memberof PopupMenu
	 */
  renderChildren() {
    const props = this.props.popupMenu[this.props.id]

    return React.Children.map(this.props.children, child => child && React.cloneElement(child, {
      id: this.props.id,
      data: props.data
    }))
  }

	/**
	 * @memberof PopupMenu
	 */
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
        ref={el => this.elementRef(el)}
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
