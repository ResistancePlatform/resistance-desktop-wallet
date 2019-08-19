// @flow
import { Decimal } from 'decimal.js'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import cn from 'classnames'
import { translate } from 'react-i18next'

import RpcPolling from '~/components/rpc-polling/rpc-polling'
import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import BuySellForm from './BuySellForm'
import OrderSummary from './OrderSummary'

import styles from './BuySell.scss'

type Props = {
  form: object,
  buySell: ResDexState.buySell
}


/**
 * @class ResDexBuySell
 * @extends {Component<Props>}
 */
class ResDexBuySell extends Component<Props> {
	props: Props

  getOrder() {
    const { form } = this.props
    const quoteCurrencyAmount = Decimal(form && form.fields.maxRel || '0')

    const { baseCurrency, quoteCurrency, orderBook } = this.props.buySell
    const { asks } = orderBook.baseQuote
    const { price } = asks.length && asks[0]
    const { isAdvanced } = this.props.buySell

    const isMarket = form && form.fields.isMarketOrder || !isAdvanced

    const isPrivate = Boolean(form && form.fields.enhancedPrivacy && isMarket)

    const order = {
      quoteCurrencyAmount,
      price: price || null,
      baseCurrency,
      quoteCurrency,
      isMarket,
      isPrivate,
    }

    return order
  }

	/**
	 * @returns
   * @memberof ResDexBuySell
	 */
	render() {
    const order = this.getOrder()

		return (
      <React.Fragment>
        <RpcPolling
          criticalChildProcess="RESDEX"
          interval={5.0}
          actions={{
            polling: ResDexBuySellActions.getOrderBook,
            success: ResDexBuySellActions.gotOrderBook,
            failure: ResDexBuySellActions.getOrderBookFailed
          }}
        />

        <div className={cn(styles.container)}>
          <div className={styles.formContainer}>
            <BuySellForm className={styles.form} />
          </div>

          <div className={styles.orderSummaryContainer}>
            <OrderSummary order={order} />
          </div>

        </div>

      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  form: state.roundedForm.resDexBuySell,
	buySell: state.resDex.buySell,
	orders: state.resDex.orders,
	accounts: state.resDex.accounts,
})

export default connect(mapStateToProps, null)(translate('resdex')(ResDexBuySell))
