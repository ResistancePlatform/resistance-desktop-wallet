// @flow
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

  getWalletContents(t, symbol: string) {
    const currency = this.props.accounts.currencies[symbol]

    return (
      <div className={styles.coin} key={symbol}>
        <CurrencyIcon symbol={symbol} size="1.6rem" />

        {getCurrencyName(symbol)}

        <div className={styles.amount}>
          {currency ? `${currency.balance} ${symbol}` : t(`N/A`)}
        </div>

        <div className={styles.equity}>
          <sub>$</sub>{currency ? toDecimalPlaces(Decimal('0.001314').mul(currency.balance), 2) : t(`N/A`)}
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
    const totalPortfolioValue = Decimal(0)

		return (
      <div className={cn(styles.container)}>

        <RpcPolling
          interval={10.0 * 60 * 60}
          actions={{
            polling: ResDexAssetsActions.getCurrencyHistory,
            success: ResDexAssetsActions.gotCurrencyHistory,
            failure: ResDexAssetsActions.getCurrencyHistoryFailed
          }}
        />

        <div className={styles.top}>
          <div className={styles.summary}>
            <div>
              {t(`Total portfolio value`)}
              <span>
                <sup>$</sup>
                {totalPortfolioValue.floor().toString()}
                <sub>.{totalPortfolioValue.minus(totalPortfolioValue.floor()).toFixed()}</sub>
              </span>
            </div>
            <div>
              {t(`Since last hour`)}
              <span><i>+</i>12,56<sub>%</sub></span>
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
