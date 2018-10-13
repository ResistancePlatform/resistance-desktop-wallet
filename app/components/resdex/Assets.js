// @flow
import log from 'electron-log'
import { Decimal } from 'decimal.js'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cn from 'classnames'
import { translate } from 'react-i18next'

import { RESDEX } from '~/constants/resdex'
import { toDecimalPlaces } from '~/utils/decimal'
import RpcPolling from '~/components/rpc-polling/rpc-polling'
import { ResDexAccountsActions } from '~/reducers/resdex/accounts/reducer'
import { ResDexAssetsActions } from '~/reducers/resdex/assets/reducer'
import CurrencyIcon from './CurrencyIcon'
import Chart from './Chart'
import { getCurrencyName } from '~/utils/resdex'

import styles from './Assets.scss'


const getResolutionCaption = (t, resolution) => ({
  hour: t(`1H`),
  day: t(`24H`),
  week: t(`1W`),
  month: t(`1M`),
  year: t(`1Y`),
})[resolution]

type Props = {
  t: any,
  i18n: any,
  accounts: ResDexAccountsState,
  assets: ResDexAssetsState,
  actions: object,
  accountsActions: object
}

/**
 * @class ResDexAssets
 * @extends {Component<Props>}
 */
class ResDexAssets extends Component<Props> {
	props: Props

  getPortfolioValueForHoursAgo(hoursNumber: number) {
    const { currencyHistory } = this.props.assets
    const { currencies } = this.props.accounts

    let value = Decimal('0')

    if (currencyHistory.hour) {
      value = Object.keys(currencyHistory.hour).reduce((previousValue, symbol) => {
        const prices = currencyHistory.hour[symbol]

        if (symbol in currencies && prices) {
          const price = prices.slice(-hoursNumber - 1)[0].value
          return previousValue.plus(price.times(currencies[symbol].balance))
        }

        return previousValue
      }, value)
    }

    return value
  }

  getSinceLastHour() {
    const now = this.getPortfolioValueForHoursAgo(0)
    const hourAgo = this.getPortfolioValueForHoursAgo(1)

    if (hourAgo.isZero()) {
      return Decimal('0')
    }

    return now.minus(hourAgo).dividedBy(hourAgo).times(Decimal(100))
  }

  getTotalPortfolioValue(): { floor: string, fraction: string } {
    const value = this.getPortfolioValueForHoursAgo(0)

    const result = {
      floor: value.floor().toFixed(),
      fraction: value.minus(value.floor()).toFixed(2).slice(2)
    }

    return result
  }

  getWalletContents(t, symbol: string) {
    const currency = this.props.accounts.currencies[symbol]
    const { currencyHistory } = this.props.assets
    const hourHistory = currencyHistory.hour && currencyHistory.hour[symbol]
    const price = hourHistory && hourHistory.slice(-1)[0].value

    return (
      <div className={styles.coin} key={symbol}>
        <CurrencyIcon symbol={symbol} size="1.6rem" />

        {getCurrencyName(symbol)}

        <div className={styles.amount}>
          {currency ? `${currency.balance} ${symbol}` : t(`N/A`)}
        </div>

        <div className={styles.equity}>
          <sub>$</sub>{currency && price ? toDecimalPlaces(price.mul(currency.balance), 2) : t(`N/A`)}
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
    const { t, i18n } = this.props

    const totalPortfolioValue = this.getTotalPortfolioValue()
    const sinceLastHour = this.getSinceLastHour()

		return (
      <div className={cn(styles.container)}>

        <div className={styles.top}>
          <div className={styles.summary}>
            <div>
              {t(`Total portfolio value`)}
              <span>
                <sup>$</sup>
                {totalPortfolioValue.floor}
                <sub>.{totalPortfolioValue.fraction}</sub>
              </span>
            </div>
            <div>
              {t(`Since last hour`)}
              <span>
                <i className={cn({ [styles.positive]: sinceLastHour.isPositive() })}>+</i>
                {sinceLastHour.abs().toFixed(2).replace('.', ',')}
                <sub>%</sub>
              </span>
            </div>
          </div>

          <ul className={styles.resolution}>
            {
              RESDEX.currencyHistoryResolutions.map((resolution) => (
                <li
                  role="none"
                  key={resolution}
                  className={cn({ [styles.active]: resolution === this.props.assets.resolution })}
                  onClick={() => this.props.actions.changeChartResolution(resolution)}
                >
                  {getResolutionCaption(t, resolution)}
                </li>
              ))
            }
          </ul>
        </div>

        <Chart
          language={i18n.language}
          resolution={this.props.assets.resolution}
          currencies={this.props.accounts.currencies}
          currencyHistory={this.props.assets.currencyHistory}
        />

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
  actions: bindActionCreators(ResDexAssetsActions, dispatch),
  accountsActions: bindActionCreators(ResDexAccountsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ResDexAssets))
