// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { NaviState } from '~/state/reducers/navi/navi.reducer'
import HLayout from '~/assets/styles/h-box-layout.scss'
import styles from './navi-bar.scss'

type Props = {
  t: any,
	navi: NaviState
}

class NaviBar extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props

    const getItemClasses = path => ({
      [HLayout.hBoxContainer]: true,
      [styles.item]: true,
      [styles.active]: this.props.navi.currentNaviPath.startsWith(path)
    })

		return (
			<div className={cn(styles.container)} data-tid="navi-bar-container">
				{/* Route items */}
				<div className={cn(styles.overview, getItemClasses('/overview'))}>
          <i />
					<NavLink to="/">{t(`Overview`)}</NavLink>
				</div>
				<div className={cn(styles.ownAddresses, getItemClasses('/own-addresses'))}>
          <i />
					<NavLink to="/own-addresses">{t(`Own Addresses`)}</NavLink>
				</div>
				<div className={cn(styles.sendCash, getItemClasses('/send-cash'))}>
          <i />
					<NavLink to="/send-cash">{t(`Send Cash`)}</NavLink>
				</div>
				<div className={cn(styles.addressBook, getItemClasses('/address-book'))}>
          <i />
					<NavLink to="/address-book">{t(`Address Book`)}</NavLink>
				</div>
				<div className={cn(styles.settings, getItemClasses('/settings'))}>
          <i />
					<NavLink to="/settings">{t(`Settings`)}</NavLink>
				</div>
				<div className={cn(styles.resdex, getItemClasses('/resdex'))}>
					<i />
          <NavLink to="/resdex">
            {t(`ResDEX`)}
            <span>{t(`Coming soon`)}</span>
          </NavLink>
				</div>

			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	navi: state.navi
})

export default connect(mapStateToProps, null)(translate('other')(NaviBar))
