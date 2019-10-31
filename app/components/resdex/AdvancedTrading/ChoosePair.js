// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import log from 'electron-log'

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

    const grouppedCurrencies = quoteSymbols.reduce((accumulated, quoteSymbol) => ({
      ...accumulated,
      [quoteSymbol]: (
        currencies
          .filter(c => c.symbol !== quoteSymbol)
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
    // const { t } = this.props

    return (
      <UniformListRow
        className={styles.row}
        key={currency.symbol}
        onClick={() => this.props.actions.updatePair(currency.symbol, quoteSymbol)}
      >
        <UniformListColumn className={styles.column} width="100%">
          {currency.symbol}/{quoteSymbol}
        </UniformListColumn>

        <UniformListColumn className={styles.column} />

      </UniformListRow>
    )
  }

	render() {
    const { t } = this.props
    const { baseCurrency, quoteCurrency } = this.props.resDex.buySell
    const grouppedCurrencies = this.getGrouppedCurrencies()
    log.debug('grouppedCurrencies', JSON.stringify(grouppedCurrencies))

    return (
      <div className={cn(styles.container, styles.choosePair)}>
        <div className={styles.info}>
          <div className={styles.pair}>
            {baseCurrency}/{quoteCurrency}
          </div>

          <div className={styles.lastPrice}>
            <div className={styles.caption}>
              {t(`Last Price`)}
            </div>
          </div>

          <div className={styles.high}>
            <div className={styles.caption}>
              {t(`{{period}} High`, {period: '1D'})}
            </div>
          </div>

          <div className={styles.low}>
            <div className={styles.caption}>
              {t(`{{period}} Low`, {period: '1D'})}
            </div>
          </div>

          <div className={styles.volume}>
            <div className={styles.caption}>
              {t(`{{period}} Volume`, {period: '1D'})}
            </div>
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
