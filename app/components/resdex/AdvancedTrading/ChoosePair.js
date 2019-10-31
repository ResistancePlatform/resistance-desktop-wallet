// @flow
import { Decimal } from 'decimal.js'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import log from 'electron-log'

import { getPeriodCaption } from '~/utils/resdex'
import { toMaxDigits } from '~/utils/decimal'
import {
  UniformList,
  UniformListHeader,
  UniformListRow,
  UniformListColumn
} from '~/components/uniform-list'
import { RoundedButton } from '~/components/rounded-form'
import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'

import styles from './ChoosePair.scss'

type Props = {
  t: any,
  resDex: ResDexState,
  actions: object
}

const na = `—`
const quoteSymbols = ['USDT', 'BTC', 'ETH', 'RES']

/**
 * @class ChoosePair
 * @extends {Component<Props>}
 */
class ChoosePair extends Component<Props> {
	props: Props

	/**
   * @memberof ChoosePair
	 */
  getGrouppedCurrencies() {
    const { RESDEX: currenciesMap } = this.props.resDex.accounts.currencies

    const currencies = Object.values(currenciesMap)

    const grouppedCurrencies = quoteSymbols.reduce((accumulated, quoteSymbol, index) => ({
      ...accumulated,
      [quoteSymbol]: (
        currencies
          .filter(c => c.symbol !== quoteSymbol && !quoteSymbols.slice(0, index).includes(c.symbol))
          .sort((c1, c2) => c1.symbol.localeCompare(c2.symbol))
      )
    }), {})

    return grouppedCurrencies
  }

	/**
   * @memberof ChoosePair
	 */
  getListHeaderRenderer(quoteSymbol) {
    // const { t } = this.props

    return (
      <UniformListHeader>
        <UniformListColumn width="100%">{quoteSymbol}</UniformListColumn>
        <UniformListColumn />
      </UniformListHeader>
    )
  }

	/**
   * @memberof ChoosePair
	 */
  getListRowRenderer(quoteSymbol, currency) {
    const { baseCurrency, quoteCurrency } = this.props.resDex.buySell

    return (
      <UniformListRow
        className={styles.row}
        key={currency.symbol}
        onClick={() => this.props.actions.updatePair(currency.symbol, quoteSymbol)}
      >
        <UniformListColumn
          className={cn(styles.column, {
            [styles.selected]: baseCurrency === currency.symbol && quoteCurrency === quoteSymbol
          })}
          width="100%"
        >
          {currency.symbol}/{quoteSymbol}
        </UniformListColumn>

        <UniformListColumn className={styles.column} />

      </UniformListRow>
    )
  }

  getLast() {
    const { trades } = this.props.resDex.buySell

    if (trades.length === 0) {
      return na
    }

    let isGreen = true

    if (trades.length >= 2) {
      isGreen = Number(trades[0].price) >= Number(trades[1].price)
    }

    return {
      price: toMaxDigits(trades[0].price),
      isGreen
    }
  }

  getOhlc(field) {
    const { ohlc } = this.props.resDex.buySell

    if (ohlc.length === 0) {
      return na
    }

    const value = ohlc[ohlc.length - 1][field]
    return toMaxDigits(Decimal(value))
  }

	render() {
    const { t } = this.props
    const { baseCurrency, quoteCurrency } = this.props.resDex.buySell
    const grouppedCurrencies = this.getGrouppedCurrencies()
    log.debug('grouppedCurrencies', JSON.stringify(grouppedCurrencies))

    const { period } = this.props.resDex.buySell.tradingChart
    const periodCaption = getPeriodCaption(period)

    const last = this.getLast()

    return (
      <div className={cn(styles.container, styles.choosePair)}>
        <div className={styles.info}>
          <div className={styles.pair}>
            {baseCurrency}/{quoteCurrency}
          </div>

          <div className={cn(styles.last, {
            [styles.high]: last.isGreen === true,
            [styles.low]: last.isGreen === false,
          })}>
            <div className={styles.caption}>
              {t(`Last Price`)}
            </div>
            {last.price}
          </div>

          <div className={styles.high}>
            <div className={styles.caption}>
              {t(`{{period}} High`, {period: periodCaption})}
            </div>
            {this.getOhlc('high')}
          </div>

          <div className={styles.low}>
            <div className={styles.caption}>
              {t(`{{period}} Low`, {period: periodCaption})}
            </div>
            {this.getOhlc('low')}
          </div>

          <div className={styles.volume}>
            <div className={styles.caption}>
              {t(`{{period}} Volume`, {period: periodCaption})}
            </div>
            {this.getOhlc('volume')}
          </div>

          <RoundedButton
            className={styles.tradingChartButton}
            onClick={this.props.actions.showTradingChartModal}
            important
            small
          >
            {t(`Chart`)}
          </RoundedButton>

        </div>

        <div className={styles.lists}>
          {quoteSymbols.map(quoteSymbol => (
            <UniformList
              className={styles.list}
              items={grouppedCurrencies[quoteSymbol]}
              headerRenderer={() => this.getListHeaderRenderer(quoteSymbol)}
              rowRenderer={currency => this.getListRowRenderer(quoteSymbol, currency)}
              emptyMessage={false}
              scrollable
            />
          ))}
        </div>

    </div>
    )
  }
}

const mapStateToProps = state => ({
  resDex: state.resDex,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexBuySellActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ChoosePair))
