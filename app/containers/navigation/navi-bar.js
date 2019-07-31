// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { SettingsState } from '~/reducers/settings/settings.reducer'
import { NaviState } from '~/reducers/navi/navi.reducer'
import { DutchAuctionState } from '~/reducers/dutch-auction/dutch-auction.reducer'

import visaLogo from '~/assets/images/visa-logo.svg'
import mastercardLogo from '~/assets/images/mastercard-logo.svg'

import HLayout from '~/assets/styles/h-box-layout.scss'
import styles from './navi-bar.scss'


type Props = {
  t: any,
	navi: NaviState,
	settings: SettingsState,
  dutchAuction: DutchAuctionState
}

class NaviBar extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props
    // const { isExpanded: isResDexExpanded } = this.props.resDex.common
    const isResDexExpanded = false

    const getItemClasses = path => ({
      [HLayout.hBoxContainer]: true,
      [styles.item]: true,
      [styles.active]: this.props.navi.currentNaviPath.startsWith(path)
    })

    const { status: dutchAuctionStatus } = this.props.dutchAuction.status

		return (
      <div className={cn(styles.container, {[styles.shrink]: isResDexExpanded})} data-tid="navi-bar-container">
        <div className={styles.draggableContainer}>
          {/* Route items */}
          <div className={cn(styles.overview, getItemClasses('/overview'))}>
            <i />
            <NavLink to="/">{t(`Home`)}</NavLink>
          </div>
          <div className={cn(styles.sendCurrency, getItemClasses('/send-currency'))}>
            <i />
            <NavLink to="/send-currency">{t(`Send Currency`)}</NavLink>
          </div>
          <div className={cn(styles.ownAddresses, getItemClasses('/own-addresses'))}>
            <i />
            <NavLink to="/own-addresses">{t(`My Addresses`)}</NavLink>
          </div>
          <div className={cn(styles.addressBook, getItemClasses('/address-book'))}>
            <i />
            <NavLink to="/address-book">{t(`Address Book`)}</NavLink>
          </div>
          <div className={cn(styles.settings, getItemClasses('/settings'))}>
            <i />
            <NavLink to="/settings">{t(`Settings`)}</NavLink>
          </div>
          <div className={cn(styles.simplex, getItemClasses('/simplex'))}>
            <i />
            <NavLink to="/simplex">
              {t(`Buy Bitcoin with`)}
              <img className={styles.visa} src={visaLogo} alt="VISA" />
              <img className={styles.mastercard} src={mastercardLogo} alt="Mastercard" />
            </NavLink>
          </div>

          <div className={cn(styles.resdex, HLayout.hBoxContainer, styles.item)}>
            <i />
            <NavLink to="/resdex" disabled>
              {t(`ResDEX`)}
              <div className={styles.comingSoon}>
                {t(`Coming 25 Aug 2019`)}
              </div>
            </NavLink>
          </div>

          {dutchAuctionStatus && dutchAuctionStatus !== 'terminated' &&
            <div className={cn(styles.dutchAuction, getItemClasses('/dutch-auction'))}>
              <i />
              <NavLink to="/dutch-auction">
                {t(`IEO — Dutch Auction`)}
              </NavLink>
            </div>
          }
        </div>

			</div>
		)
	}
}

const mapStateToProps = state => ({
	navi: state.navi,
	settings: state.settings,
  resDex: state.resDex,
  dutchAuction: state.dutchAuction
})

export default connect(mapStateToProps, null)(translate('other')(NaviBar))
