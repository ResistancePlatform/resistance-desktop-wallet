// @flow
import React, { Component } from 'react'
import { Balances } from '../../state/reducers/overview/overview.reducer'
import styles from './Balance.scss'
import HLayout from '../../theme/h-box-layout.scss'

type Props = {
	balances: Balances
}

export default class Balance extends Component<Props> {
	props: Props

	hasUnconfirmedTransactionBalance(balanceType) {
		const tempBalances = this.props.balances
		if (balanceType === 'transparent') {
			return tempBalances && tempBalances.transparentBalance !== tempBalances.transparentUnconfirmedBalance
		} else if (balanceType === 'private') {
			return tempBalances && tempBalances.privateBalance !== tempBalances.privateUnconfirmedBalance
		} else if (balanceType === 'total') {
			return tempBalances && tempBalances.totalBalance !== tempBalances.totalUnconfirmedBalance
		}

		return false
	}

	getBalanceValueStyles(balanceType) {
		let hasUnconfirmed = false

		if (balanceType === 'transparent') {
			hasUnconfirmed = this.hasUnconfirmedTransactionBalance(balanceType)
		} else if (balanceType === 'private') {
			hasUnconfirmed = this.hasUnconfirmedTransactionBalance(balanceType)
		} else if (balanceType === 'total') {
			hasUnconfirmed = this.hasUnconfirmedTransactionBalance(balanceType)
		}

		return hasUnconfirmed ? `${styles.balanceValue} ${styles.hasUnconfirmedTransactionBalance}` : `${styles.balanceValue}`
	}

	render() {
		return (
			<div className={[HLayout.hBoxContainer, styles.balanceContainer].join(' ')} data-tid="balance-container">

				<div className={[styles.transparentBalance, HLayout.hBoxChild].join(' ')}>
					<div className={styles.balanceWraper}>
						<div className={styles.balanceTitle}>TRANSPARENT BALANCE (T)</div>
						<div className={this.getBalanceValueStyles('transparent')}>
							{this.props.balances.transparentUnconfirmedBalance ? this.props.balances.transparentUnconfirmedBalance : 0}
							<span className={styles.balanceValueUnit}>RES</span>
						</div>
					</div>
				</div>

				<div className={[styles.privateBalance, HLayout.hBoxChild].join(' ')}>
					<div className={styles.balanceTitle}>PRIVATE BALANCE (R)</div>
					<div className={this.getBalanceValueStyles('private')}>
						{this.props.balances.privateUnconfirmedBalance ? this.props.balances.privateUnconfirmedBalance : 0}
						<span className={styles.balanceValueUnit}>RES</span>
					</div>
				</div>

				<div className={[styles.totalBalance, HLayout.hBoxChild].join(' ')}>
					<div className={styles.balanceTitle}>TOTAL BALANCE (R + T)</div>
					<div className={this.getBalanceValueStyles('total')}>
						{this.props.balances.totalUnconfirmedBalance ? this.props.balances.totalUnconfirmedBalance : 0}
						<span className={styles.balanceValueUnit}>RES</span>
					</div>
				</div>

			</div>
		)
	}
}
