// @flow
import { Decimal } from 'decimal.js'
import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cn from 'classnames'
import { translate } from 'react-i18next'
import {
  FlexibleWidthXYPlot,
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
          <sub>$</sub>{currency ? Decimal('0.001314').mul(currency.balance).toString() : t(`N/A`)}
        </div>

        <div className={styles.buttons}>
          <button
            type="button"
            onClick={() => this.props.accountsActions.showWithdrawModal(currency.symbol)}
            disabled={!currency || currency.balance.isZero()}
          >
            {t(`Withdraw`)}
          </button>

          <button
            type="button"
            onClick={() => this.props.accountsActions.showDepositModal(currency.symbol)}
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

    const btcPlotPrices = [
      {'x':1511308800, 'y':8268.035}, {'x':1511395200, 'y':8148.95}, {'x':1511481600, 'y':8250.978333333334}, {'x':1511568000, 'y':8707.407266666667},
      {'x':1511654400, 'y':9284.1438}, {'x':1511740800, 'y':9718.29505}, {'x':1511827200, 'y':9952.50882}, {'x':1511913600, 'y':9879.328333333333},
      {'x':1512000000, 'y':10147.372}, {'x':1512086400, 'y':10883.912}, {'x':1512172800, 'y':11071.368333333332}, {'x':1512259200, 'y':11332.622},
      {'x':1512345600, 'y':11584.83}, {'x':1512432000, 'y':11878.433333333334}, {'x':1512518400, 'y':13540.980000000001}, {'x':1512604800, 'y':16501.971666666668},
      {'x':1512691200, 'y':16007.436666666666}, {'x':1512777600, 'y':15142.834152123332}, {'x':1512864000, 'y':14869.805}, {'x':1512950400, 'y':16762.116666666665},
      {'x':1513036800, 'y':17276.393333333333}, {'x':1513123200, 'y':16808.366666666665}, {'x':1513209600, 'y':16678.892}, {'x':1513296000, 'y':17771.899999999998},
      {'x':1513382400, 'y':19498.683333333334}, {'x':1513468800, 'y':19289.785}, {'x':1513555200, 'y':18961.856666666667}, {'x':1513641600, 'y':17737.111666666668},
      {'x':1513728000, 'y':16026.271666666667}
    ]

    const maxPrice = Math.max(...btcPlotPrices.map(point => point.y))
    const plotData = btcPlotPrices.map((point, index) => ({
      x: moment().add(-btcPlotPrices.length + index - 1, 'days'),
      y: point.y
    }))

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

        <div className={styles.chartContainer}>
          <FlexibleWidthXYPlot
            className={styles.chart}
            height={119}
            yDomain={[maxPrice / 8, maxPrice]}
            xType="time"
            margin={{left: 0, right: 0, top: 0, bottom: 0}}
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
        tickTotal={9}
        top={78}
        style={{
          line: {stroke: 'transparent'},
          text: {
            fill: '#a4abc7',
            fontFamily: 'inherit',
            fontSize: '0.55rem',
            fontWeight: '100',
            textTransform: 'uppercase'
          }
        }}
        hideLine
      />
    </FlexibleWidthXYPlot>
  </div>

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
