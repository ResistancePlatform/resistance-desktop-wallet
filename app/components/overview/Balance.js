// @flow
import React, { Component } from 'react'
import classNames from 'classnames'
import { translate } from 'react-i18next'

import { truncateAmount } from '~/constants'
import { Balances } from '~/reducers/overview/overview.reducer'

import styles from './Balance.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'

type Props = {
  t: any,
	balances: Balances
}

class Balance extends Component<Props> {
	props: Props

	hasUnconfirmedTransactionBalance(balanceType) {
		const tempBalances = this.props.balances

		if (balanceType === 'transparent') {
			return tempBalances && !tempBalances.transparentBalance.equals(tempBalances.transparentUnconfirmedBalance)
    }

    if (balanceType === 'private') {
			return tempBalances && !tempBalances.privateBalance.equals(tempBalances.privateUnconfirmedBalance)
    }

    if (balanceType === 'total') {
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

	renderBalanceValue(balanceString: stirng) {
		const strArr = balanceString.split('.')
		return (
			<span>
				<span className={classNames(styles.balanceFrontPart)}>{strArr[0]}</span>
				<span className={classNames(styles.balanceDecimalPart)}>.{strArr.length > 1 ? strArr[1] : ''}</span>
			</span>
		)
	}

	render() {
    const { t } = this.props

		return (
			<div className={[HLayout.hBoxContainer, styles.balanceContainer].join(' ')} data-tid="balance-container">

				<div className={[styles.transparentBalance, HLayout.hBoxChild].join(' ')}>
					<div className={styles.balanceWraper}>
						<div className={styles.balanceTitle}>{t(`Transparent balance (R)`)}</div>
						<div className={this.getBalanceValueStyles('transparent')}>
							{this.renderBalanceValue(truncateAmount(this.props.balances.transparentUnconfirmedBalance))}
							<span className={styles.balanceValueUnit}>RES</span>
						</div>
					</div>
				</div>

				<div className={[styles.privateBalance, HLayout.hBoxChild].join(' ')}>
					<div className={styles.balanceWraper}>
						<div className={styles.balanceTitle}>{t(`Private balance (Z)`)}</div>
						<div className={this.getBalanceValueStyles('private')}>
							{this.renderBalanceValue(truncateAmount(this.props.balances.privateUnconfirmedBalance))}
							<span className={styles.balanceValueUnit}>RES</span>
						</div>
					</div>
				</div>

				<div className={[styles.totalBalance, HLayout.hBoxChild].join(' ')}>
					<div className={styles.balanceWraper}>
						<div className={styles.balanceTitle}>{t(`Total balance (R + Z)`)}</div>
						<div className={this.getBalanceValueStyles('total')}>
							{this.renderBalanceValue(truncateAmount(this.props.balances.totalUnconfirmedBalance))}
							<span className={styles.balanceValueUnit}>RES</span>
						</div>
					</div>
				</div>

			</div>
		)
	}
}

export default translate('overview')(Balance)
