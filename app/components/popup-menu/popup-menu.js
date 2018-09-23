// @flow
import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import cn from 'classnames'

import { appStore } from '~/store/configureStore'
import { PopupMenuState, PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'

import styles from './popup-menu.scss'

type Props = {
  id: string,
  className?: string,
  relative?: boolean,
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
			display: props.isVisible ? 'block' : 'none'
		}

    if (this.props.relative) {
      containerStyles.position = 'relative'
    } else {
      Object.assign(containerStyles, {
        position: 'absolute',
        top: props.top,
        left: props.left
      })
    }


		return (
			<div
				className={cn(styles.container, this.props.className)}
				style={containerStyles}
        ref={el => this.elementRef(el)}
			>
        <div className={styles.menu}>
          {this.renderChildren()}
        </div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	popupMenu: state.popupMenu,
})

export default connect(mapStateToProps, null)(PopupMenu)
