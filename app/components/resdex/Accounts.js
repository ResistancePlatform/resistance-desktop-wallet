// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { ResDexActions } from '~/reducers/resdex/resdex.reducer'

import styles from './Accounts.scss'

type Props = {
  t: any
}


/**
 * @class ResDexAccounts
 * @extends {Component<Props>}
 */
class ResDexAccounts extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof ResDexAccounts
	 */
	render() {
    const { t } = this.props

		return (
      <div className={cn(styles.container)}>
        <div className={styles.accountsContainer}>
          <div className={styles.record}>
            <div className={styles.columnsWrapper}>
              <div className={styles.account}>
                <img src="assets/images/resdex/BTC.svg" alt="Bitcoin"/>
              </div>

              <div className={styles.balance}>
                <span>Bitcoin</span>
                -0.09351917 BTC
              </div>

              <div className={styles.equity}>
                <i>$</i>279.21
              </div>

              <div className={styles.more}>
                <span className={styles.button} />
              </div>

            </div>

            <div className={styles.rateBar}>
              <div className={styles.btc} style={{ width: `77%` }} />
            </div>

          </div>

          <div className={styles.addNewCoin}>
            <span className={cn('icon', styles.button)} />{t(`Add new coin`)}
          </div>

        </div>

        <div className={styles.historyContainer}>
          <div className={styles.record}>
            <div className={styles.date}>
              <span>Aug</span>
              27
            </div>

            <div className={styles.description}>
              <span>{t(`Sent {{name}}`, { name: 'Bitcoin'})}</span>
              {t(`To {{name}} address`, { name: 'Bitcoin' })}
            </div>

            <div className={styles.amount}>
              <span>-0.09351917 BTC</span>
              -$25.52
            </div>

          </div>
        </div>
      </div>
    )
  }
}


const mapStateToProps = state => ({
  orders: state.resDex.orders
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexActions.orders, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ResDexAccounts))
