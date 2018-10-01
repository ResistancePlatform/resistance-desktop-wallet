// @flow
import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cn from 'classnames'
import { translate } from 'react-i18next'
import {
  XYPlot,
  XAxis,
  GradientDefs,
  linearGradient,
  LineSeries,
  AreaSeries
} from 'react-vis'

import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'
import CurrencyIcon from './CurrencyIcon'
import { getCurrencyName } from '~/utils/resdex'

import styles from './Assets.scss'

type Props = {
  t: any,
  accounts: ResDexAccountsState,
  accountsActions: object
}


/**
 * @class ResDexAssets
 * @extends {Component<Props>}
 */
class ResDexAssets extends Component<Props> {
	props: Props

  getWalletContents(t, symbol: string) {
    const currency = this.props.accounts.currencies[symbol]

    return (
      <div className={styles.coin}>
        <CurrencyIcon symbol={symbol} size="1.6rem" />

        {getCurrencyName(symbol)}

        <div className={styles.amount}>
          {currency ? `${currency.balance} ${symbol}` : t(`N/A`)}
        </div>

        <div className={styles.equity}>
          <sub>$</sub>{currency ? currency.price.mul(currency.balance).toString() : t(`N/A`)}
        </div>

        <div className={styles.buttons}>
          <button
            type="button"
            onClick={() => this.props.accountsActions.withdraw(currency.symbol)}
            disabled={!currency}
          >
            {t(`Withdraw`)}
          </button>

          <button
            type="button"
            onClick={() => this.props.accountsActions.deposit(currency.symbol)}
            disabled={!currency}
          >
            {t(`Deposit`)}
          </button>
        </div>
      </div>
    )
  }

	/**
	 * @returns
   *
   * @memberof ResDexAssets
	 */
	render() {
    const { t } = this.props

    console.log('this.props.accounts.enabledCurrencies', this.props.accounts.enabledCurrencies)
    const plotData = [
      {x: moment().add(-1, 'months'), y: 12},
      {x: moment().add(-2, 'months'), y: 15},
      {x: moment().add(-3, 'months'), y: 7},
      {x: moment().add(-4, 'months'), y: 9}
    ]

		return (
      <div className={cn(styles.container)}>

        <div className={styles.top}>
          <div className={styles.summary}>
            <div>
              {t(`Total portfolio value`)}
              <span><sup>$</sup>240<sub>.12</sub></span>
            </div>
            <div>
              {t(`Since last hour`)}
              <span><i>+</i>12,56<sub>%</sub></span>
            </div>
          </div>

          <ul className={styles.period}>
            <li>{t(`1H`)}</li>
            <li>{t(`24H`)}</li>
            <li>{t(`1W`)}</li>
            <li className={styles.active}>{t(`1M`)}</li>
            <li>{t(`1Y`)}</li>
          </ul>
        </div>

        <XYPlot
          className={styles.chart}
          xType="time"
          width={796}
          height={159}
          margin={{left: 0, right: 0, top: 0, bottom: 40}}
        >

          <GradientDefs>
            <linearGradient id="fillGradient" x1="0" y1="1" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e4266" />
              <stop offset="100%" stopColor="#3f356e" />
            </linearGradient>
            <linearGradient id="outlineGradient" x1="0" y1="1" x2="1" y2="1">
              <stop offset="0%" stopColor="#009ed7" />
              <stop offset="100%" stopColor="#9c62e5" />
            </linearGradient>
          </GradientDefs>

          <AreaSeries
            color="url(#fillGradient)"
            data={plotData}
          />

          {/* Outline */}
          <LineSeries
            strokeWidth={1}
            color="url(#outlineGradient)"
            data={plotData}
          />

          <XAxis
            left={20}
            top={80}
            style={{
              line: {stroke: 'transparent'},
              text: {
                fill: '#a4abc7',
                fontFamily: 'inherit',
                fontSize: '0.6rem',
                textTransform: 'uppercase'
              }
            }}
            hideLine
          />
        </XYPlot>

        <div className={styles.coins}>
          {this.props.accounts.enabledCurrencies.map(currency => this.getWalletContents(t, currency.symbol))}
        </div>

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
	assets: state.resDex.assets,
	accounts: state.resDex.accounts
})

const mapDispatchToProps = dispatch => ({
  accountsActions: bindActionCreators(ResDexAccountsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ResDexAssets))
