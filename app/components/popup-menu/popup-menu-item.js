// @flow
import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'

import { appStore } from '../../state/store/configureStore'
import { PopupMenuActions } from '../../state/reducers/popup-menu/popup-menu.reducer'

import styles from './popup-menu.scss'

type Props = {
  id: string,
  data: any,
  onClick: func
}

class PopupMenuItem extends Component<Props> {
	props: Props
  state: State

  static propTypes = {
    children: PropTypes.node.isRequired
  }

  handleClick(event) {
    this.props.onClick(event, this.props.data)
		appStore.dispatch(PopupMenuActions.hide(this.props.id))
    return false
  }

	render() {
		return (
      <div
        className={styles.menuItem}
        onClick={(e) => this.handleClick(e)}
        onKeyDown={(e) => this.handleClick(e)}
      >
        {this.props.children}
      </div>
		)
	}
}

const mapStateToProps = state => ({
	popupMenu: state.popupMenu,
})

export default connect(mapStateToProps, null)(PopupMenuItem)
