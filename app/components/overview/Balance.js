// @flow
import React, { Component } from 'react'

import { truncateAmount } from '../../constants'
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
			return tempBalances && !tempBalances.transparentBalance.equals(tempBalances.transparentUnconfirmedBalance)
		} else if (balanceType === 'private') {
			return tempBalances && !tempBalances.privateBalance.equals(tempBalances.privateUnconfirmedBalance)
		} else if (balanceType === 'total') {
			return tempBalances && !tempBalances.totalBalance.equals(tempBalances.totalUnconfirmedBalance)
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
							{truncateAmount(this.props.balances.transparentUnconfirmedBalance)}
							<span className={styles.balanceValueUnit}>RES</span>
						</div>
					</div>
				</div>

				<div className={[styles.privateBalance, HLayout.hBoxChild].join(' ')}>
					<div className={styles.balanceWraper}>
						<div className={styles.balanceTitle}>PRIVATE BALANCE (R)</div>
						<div className={this.getBalanceValueStyles('private')}>
							{truncateAmount(this.props.balances.privateUnconfirmedBalance)}
							<span className={styles.balanceValueUnit}>RES</span>
						</div>
					</div>
				</div>

				<div className={[styles.totalBalance, HLayout.hBoxChild].join(' ')}>
					<div className={styles.balanceWraper}>
						<div className={styles.balanceTitle}>TOTAL BALANCE (R + T)</div>
						<div className={this.getBalanceValueStyles('total')}>
							{truncateAmount(this.props.balances.totalUnconfirmedBalance)}
							<span className={styles.balanceValueUnit}>RES</span>
						</div>
					</div>
				</div>

			</div>
		)
	}
}
