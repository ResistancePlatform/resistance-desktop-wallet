// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import styles from './navi-bar.scss'
import { NaviState } from '../../state/reducers/navi/navi.reducer'
import HLayout from '../../theme/h-box-layout.scss'

type Props = {
	navi: NaviState
}

class NaviBar extends Component<Props> {
	props: Props

  // TODO: Replace with classnames #114
	getNaviBarItemClasses(itemPath: string) {
		return this.props.navi.currentNaviPath === itemPath ? `${styles.naviVBarItem} ${styles.activeNaviVBarItem}` : `${styles.naviVBarItem}`
	}

	render() {
		return (
			<div className={[styles.navibarContainer].join(' ')} data-tid="navi-bar-container">
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
