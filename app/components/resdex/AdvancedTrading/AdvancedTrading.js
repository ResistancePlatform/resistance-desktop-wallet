import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'

import RpcPolling from '~/components/rpc-polling/rpc-polling'
import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { RoundedFormActions } from '~/reducers/rounded-form/rounded-form.reducer'
import TradingChart from './TradingChart'
import BuySellForm from '../BuySellForm'
import IndicatorsModal from './IndicatorsModal'
import OrderBook from './OrderBook'
import Trades from './Trades'

import styles from './AdvancedTrading.scss'

type Props = {
  buySell: ResDexState.buySell,
  accounts: ResDexState.accounts,
  formActions: object
}

/**
 * @class ResDexAdvancedTrading
 * @extends {Component<Props>}
 */
class ResDexAdvancedTrading extends Component<Props> {
	props: Props

	/**
	 * @returns
   * @memberof ResDexAdvancedTrading
	 */
	render() {
    const {
      baseCurrency,
      quoteCurrency,
      orderBook,
      trades,
      indicatorsModal
    } = this.props.buySell
    const { RESDEX: currencies } = this.props.accounts.currencies

    const baseSmartAddress = baseCurrency in currencies ? currencies[baseCurrency].address : null
    const quoteSmartAddress = quoteCurrency in currencies ? currencies[quoteCurrency].address : null

		return (
      <React.Fragment>
        <RpcPolling
          criticalChildProcess="RESDEX"
          interval={10.0}
          actions={{
            polling: ResDexBuySellActions.getOrderBook,
            success: ResDexBuySellActions.gotOrderBook,
            failure: ResDexBuySellActions.getOrderBookFailed
          }}
        />

        <RpcPolling
          interval={60.0}
          criticalChildProcess="RESDEX"
          actions={{
            polling: ResDexBuySellActions.getTrades,
            success: ResDexBuySellActions.gotTrades,
            failure: ResDexBuySellActions.getTradesFailed
          }}
        />

        <RpcPolling
          interval={60.0}
          criticalChildProcess="RESDEX"
          actions={{
            polling: ResDexBuySellActions.getOhlc,
            success: ResDexBuySellActions.gotOhlc,
            failure: ResDexBuySellActions.getOhlcFailed
          }}
        />

        {indicatorsModal.isVisible &&
          <IndicatorsModal />
        }

        <div className={styles.container}>
          <div className={styles.chartContainer}>
            <TradingChart />
          </div>

          <div className={styles.widgetsContainer}>
            <BuySellForm
              className={styles.buySellForm}
              isAdvanced
            />
            <div className={styles.listsContainer}>
              <OrderBook
                className={styles.orderBook}
                baseCurrency={baseCurrency}
                quoteCurrency={quoteCurrency}
                baseSmartAddress={baseSmartAddress}
                quoteSmartAddress={quoteSmartAddress}
                onPickPrice={price => this.props.formActions.updateField('resDexBuySell', 'price', price.toString())}
                orderBook={orderBook.baseQuote}
              />
              <Trades
                baseCurrency={baseCurrency}
                quoteCurrency={quoteCurrency}
                trades={trades}
              />
            </div>
          </div>
        </div>
      </React.Fragment>
		)
  }
}

const mapStateToProps = (state) => ({
  form: state.roundedForm.resDexBuySell,
	buySell: state.resDex.buySell,
	accounts: state.resDex.accounts,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexBuySellActions, dispatch),
  formActions: bindActionCreators(RoundedFormActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ResDexAdvancedTrading))
