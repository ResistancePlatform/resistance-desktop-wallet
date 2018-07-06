// @flow
import React, { Component } from 'react'
import styles from './Balance.scss'
import HLayout from '../../theme/h-box-layout.scss'

type Props = {}

export default class Balance extends Component<Props> {
  props: Props

  render() {
    return (
      <div className={[HLayout.hBoxContainer, styles.balanceContainer].join(' ')} data-tid="balance-container">

        <div className={[styles.transparentBalance, HLayout.hBoxChild].join(' ')}>
          <div className={styles.balanceWraper}>
            <div className={styles.balanceTitle}>TRANSPARENT BALANCE (T)</div>
            <div className={styles.balanceValue}>
              24.12
            <span className={styles.balanceValueUnit}>RES</span>
            </div>
          </div>
        </div>

        <div className={[styles.privateBalance, HLayout.hBoxChild].join(' ')}>
          <div className={styles.balanceTitle}>PRIVATE BALANCE (R)</div>
          <div className={styles.balanceValue}>
            170.39
            <span className={styles.balanceValueUnit}>RES</span>
          </div>
        </div>

        <div className={[styles.totalBalance, HLayout.hBoxChild].join(' ')}>
          <div className={styles.balanceTitle}>TOTAL BALANCE (R + T)</div>
          <div className={styles.balanceValue}>
            194.51
            <span className={styles.balanceValueUnit}>RES</span>
          </div>
        </div>

      </div>
    )
  }
}
