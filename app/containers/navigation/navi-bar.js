// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { SettingsState } from '~/reducers/settings/settings.reducer'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ChildProcessService } from '~/service/child-process-service'
import { NaviState } from '~/reducers/navi/navi.reducer'

import visaLogo from '~/assets/images/visa-logo.svg'
import mastercardLogo from '~/assets/images/mastercard-logo.svg'

import HLayout from '~/assets/styles/h-box-layout.scss'
import statusStyles from '~/assets/styles/status-colors.scss'
import styles from './navi-bar.scss'


const childProcess = new ChildProcessService()

type Props = {
  t: any,
	navi: NaviState,
	settings: SettingsState,
  resDex: ResDexState
}

class NaviBar extends Component<Props> {
	props: Props

  getPendingOrdersNumber(): number {
    const { swapHistory } = this.props.resDex.orders
    const completed = status => ['completed', 'failed', 'cancelled'].includes(status)

    const pendingSwaps = swapHistory.filter(swap => (
      !swap.isHidden
      && !(!swap.isPrivate && completed(swap.status))
      && !(swap.isPrivate && completed(swap.privacy.status))
    ))

    return pendingSwaps.length
  }

	render() {
    const { t } = this.props

    const getItemClasses = path => ({
      [HLayout.hBoxContainer]: true,
      [styles.item]: true,
      [styles.active]: this.props.navi.currentNaviPath.startsWith(path)
    })

    const pendingOrdersNumber = this.getPendingOrdersNumber()
    const resDexStatus = this.props.settings.childProcessesStatus.RESDEX

		return (
      <div className={cn(styles.container)} data-tid="navi-bar-container">
        <div className={styles.draggableContainer}>
          {/* Route items */}
          <div className={cn(styles.overview, getItemClasses('/overview'))}>
            <i />
            <NavLink to="/">{t(`Home`)}</NavLink>
          </div>
          <div className={cn(styles.sendCash, getItemClasses('/send-cash'))}>
            <i />
            <NavLink to="/send-cash">{t(`Send Currency`)}</NavLink>
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
          <div className={cn(styles.resdex, getItemClasses('/resdex'))}>
            <i />
            <NavLink to="/resdex">
              {t(`ResDEX`)}

              {!this.props.resDex.login.isRequired &&
                <div
                  className={cn(
                    styles.resDexStatus,
                    statusStyles[childProcess.getChildProcessStatusColor(resDexStatus)],
                    { [styles.hasOrders]: resDexStatus  === 'RUNNING' && Boolean(pendingOrdersNumber) }
                  )}
                >
                  <div className={styles.number}>
                    {pendingOrdersNumber || false}
                  </div>
                </div>
              }
            </NavLink>
          </div>
        </div>

			</div>
		)
	}
}

const mapStateToProps = state => ({
	navi: state.navi,
	settings: state.settings,
  resDex: state.resDex
})

export default connect(mapStateToProps, null)(translate('other')(NaviBar))
