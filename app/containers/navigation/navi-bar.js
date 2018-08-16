// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import styles from './navi-bar.scss'
import { NaviActions, NaviState } from '../../state/reducers/navi/navi.reducer'
import { appStore } from '../../state/store/configureStore'
import HLayout from '../../theme/h-box-layout.scss'

type Props = {
	navi: NaviState
}

class NaviBar extends Component<Props> {
	props: Props

	onCloseClicked(event) {
		event.preventDefault();
		appStore.dispatch(NaviActions.mainWindowClose())
	}

	onMinimizeClicked(event) {
		event.preventDefault();
		appStore.dispatch(NaviActions.mainWindowMinimize())
	}

	onMaximizeClicked(event) {
		event.preventDefault();
		appStore.dispatch(NaviActions.mainWindowMaximize())
	}

	getNaviBarItemClasses(itemPath: string) {
		return this.props.navi.currentNaviPath === itemPath ? `${styles.naviVBarItem} ${styles.activeNaviVBarItem}` : `${styles.naviVBarItem}`
	}

	render() {
		return (
			<div className={[styles.navibarContainer].join(' ')} data-tid="navi-bar-container">

				{/* Embedded toolbar */}
				<div className={[styles.navibarToolbarContainer]}>
					<div className={styles.closeButton} onClick={(event) => this.onCloseClicked(event)} onKeyDown={(event) => this.onCloseClicked(event)} />
					<div className={styles.minimizeButton} onClick={(event) => this.onMinimizeClicked(event)} onKeyDown={(event) => this.onMinimizeClicked(event)} />
					<div className={styles.fullScreenButton} onClick={(event) => this.onMaximizeClicked(event)} onKeyDown={(event) => this.onMaximizeClicked(event)} />
				</div>

				{/* Route items */}
				<div className={[this.getNaviBarItemClasses('/overview'), HLayout.hBoxContainer].join(' ')}>
					<span className="icon-overview" />
					<NavLink to="/">Overview</NavLink>
				</div>
				<div className={[this.getNaviBarItemClasses('/own-addresses'), HLayout.hBoxContainer].join(' ')}>
					<span className="icon-own-address" />
					<NavLink to="/own-addresses">Own Addresses</NavLink>
				</div>
				<div className={[this.getNaviBarItemClasses('/send-cash'), HLayout.hBoxContainer].join(' ')}>
					<span className="icon-send-cash" />
					<NavLink to="/send-cash">Send Cash</NavLink>
				</div>
				<div className={[this.getNaviBarItemClasses('/address-book'), HLayout.hBoxContainer].join(' ')}>
					<span className="icon-address-book" />
					<NavLink to="/address-book">Address Book</NavLink>
				</div>
				<div className={[this.getNaviBarItemClasses('/settings'), HLayout.hBoxContainer].join(' ')}>
					<span className="icon-settings" />
					<NavLink to="/settings">Settings</NavLink>
				</div>

			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	navi: state.navi
})

export default connect(mapStateToProps, null)(NaviBar);
