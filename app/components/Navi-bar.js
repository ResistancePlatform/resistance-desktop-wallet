// @flow
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import styles from './Navi-bar.scss'
import layout from '../theme/h-box-layout.scss'

type Props = {}

export default class NaviBar extends Component<Props> {
  props: Props

  render() {
    return (
      <div className={[styles.navibarContainer].join(' ')} data-tid="navi-bar-container">

        {/* Embedded toolbar */}
        <div className={[styles.navibarToolbarContainer]}>
          <div className={styles.closeButton} />
          <div className={styles.minimizeButton} />
          <div className={styles.fullScreenButton} />
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
