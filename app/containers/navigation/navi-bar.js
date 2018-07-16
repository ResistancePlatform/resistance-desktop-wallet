// @flow
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import styles from './navi-bar.scss'
import { NaviActions } from '../../state/reducers/navi/navi.reducer'
import { appStore } from '../../state/store/configureStore'

type Props = {}

export default class NaviBar extends Component<Props> {
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
        <div className={styles.naviVBarItem}>
          <NavLink to="/" activeClassName="active">
            <span className="fa fa-star fa-fw" />Overview
          </NavLink>
        </div>
        <div className={styles.naviVBarItem}>
          <span className="fa fa-windows fa-fw" />
          <NavLink to="/own-addresses" activeClassName="active">Own Addresses</NavLink>
        </div>
        <div className={styles.naviVBarItem}>
          <span className="fa fa-envelope fa-fw" />
          <NavLink to="/send-cash" activeClassName="active">Send Cash</NavLink>
        </div>
        <div className={styles.naviVBarItem}>
          <span className="fa fa-font fa-fw" />
          <NavLink to="/address-book" activeClassName="active">Address Book</NavLink>
        </div>
        <div className={styles.naviVBarItem}>
          <span className="fa fa-cog fa-fw" />
          <NavLink to="/settings">Settings</NavLink>
        </div>

      </div>
    )
  }
}
