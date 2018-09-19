// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { translate } from 'react-i18next'

import { NaviState } from '~/state/reducers/navi/navi.reducer'
import HLayout from '~/theme/h-box-layout.scss'
import styles from './navi-bar.scss'

type Props = {
  t: any,
	navi: NaviState
}

class NaviBar extends Component<Props> {
	props: Props

  // TODO: Replace with classnames #114
	getNaviBarItemClasses(itemPath: string) {
		return this.props.navi.currentNaviPath === itemPath ? `${styles.naviVBarItem} ${styles.activeNaviVBarItem}` : `${styles.naviVBarItem}`
	}

	render() {
    const { t } = this.props

		return (
			<div className={[styles.navibarContainer].join(' ')} data-tid="navi-bar-container">
				{/* Route items */}
				<div className={[this.getNaviBarItemClasses('/overview'), HLayout.hBoxContainer].join(' ')}>
					<span className="icon-overview" />
					<NavLink to="/">{t(`Overview`)}</NavLink>
				</div>
				<div className={[this.getNaviBarItemClasses('/own-addresses'), HLayout.hBoxContainer].join(' ')}>
					<span className="icon-own-address" />
					<NavLink to="/own-addresses">{t(`Own Addresses`)}</NavLink>
				</div>
				<div className={[this.getNaviBarItemClasses('/send-cash'), HLayout.hBoxContainer].join(' ')}>
					<span className="icon-send-cash" />
					<NavLink to="/send-cash">{t(`Send Cash`)}</NavLink>
				</div>
				<div className={[this.getNaviBarItemClasses('/address-book'), HLayout.hBoxContainer].join(' ')}>
					<span className="icon-address-book" />
					<NavLink to="/address-book">{t(`Address Book`)}</NavLink>
				</div>
				<div className={[this.getNaviBarItemClasses('/settings'), HLayout.hBoxContainer].join(' ')}>
					<span className="icon-settings" />
					<NavLink to="/settings">{t(`Settings`)}</NavLink>
				</div>

			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	navi: state.navi
})

export default connect(mapStateToProps, null)(translate('other')(NaviBar))
