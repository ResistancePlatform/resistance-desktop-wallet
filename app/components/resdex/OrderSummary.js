// @flow
import { Decimal } from 'decimal.js'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { RESDEX } from '~/constants/resdex'
import { truncateAmount, toDecimalPlaces } from '~/utils/decimal'
import CurrencyIcon from './CurrencyIcon'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'

import styles from './OrderSummary.scss'

type Props = {
  t: any,
  className?: string,
  order: {
    orderType: 'buy' | 'sell',
    quoteCurrencyAmount: object,
    price: object | null,
    baseCurrency: string,
    quoteCurrency: string,
    enhancedPrivacy: boolean
  },
  accounts: ResDexState.accounts
}

/**
 * @class OrderSummary
 * @extends {Component<Props>}
 */
class OrderSummary extends Component<Props> {
	props: Props

  getTxFee(): Decimal | null {
    const { quoteCurrency } = this.props.order
    const txFee = this.props.accounts.currencyFees[quoteCurrency] || null
    return txFee
  }

  getBaseAmount(): Decimal | null {
    const { quoteCurrencyAmount, price } = this.props.order
    const txFee = this.getTxFee() || Decimal(0)

    if (price === null) {
      return null
    }

    const dexFee = RESDEX.dexFee.div(Decimal('100'))
    const divider = Decimal(price).plus(Decimal(price).times(dexFee)).plus(txFee)
    const baseAmount = Decimal(quoteCurrencyAmount).dividedBy(divider)

    return baseAmount
  }

  getMaxPayoutCaption(): string {
    const { baseCurrency } = this.props.order
    const baseAmount = this.getBaseAmount()

    if (baseAmount === null) {
      return `0 ${baseCurrency}`
    }

    return `${toDecimalPlaces(baseAmount)} ${baseCurrency}`
  }

  getAtCaption(t) {
    const { price, baseCurrency, quoteCurrency } = this.props.order

    if (price === null) {
      return t(`No liquidity available yet`)
    }

    return t(`@ {{price}} {{quoteCurrency}} per {{baseCurrency}}`, {
      price: truncateAmount(Decimal(price)),
      baseCurrency,
      quoteCurrency
    })

  }

	render() {
    const { order, t } = this.props
    const txFee = this.getTxFee()

    return (
      <div className={cn(styles.container, this.props.className)}>
        <div className={styles.briefContainer}>
          <div className={styles.brief}>{t(`You are sending`)}</div>

          <div className={styles.amount}>
            {toDecimalPlaces(Decimal(order.quoteCurrencyAmount))}
            <span>{order.quoteCurrency}</span>
          </div>

          <div className={styles.at}>{this.getAtCaption(t)}</div>

        </div>

        <div className={styles.fromTo}>
          <div className={styles.wallet}>
            <CurrencyIcon symbol={order.quoteCurrency} size="1.24rem" />
            <div>
              <span>{t(`Send`)}</span>
              {t(`{{quoteCurrency}} Wallet`, { quoteCurrency: order.quoteCurrency })}
            </div>
          </div>

          <div className={cn('icon', styles.exchangeIcon)} />

          <div className={styles.wallet}>
            <CurrencyIcon symbol={order.baseCurrency} size="1.24rem" />
            <div>
              <span>{t(`Receive`)}</span>
              {t(`{{baseCurrency}} Wallet`, { baseCurrency: order.baseCurrency })}
            </div>
          </div>

        </div>

        <ul className={styles.list}>
          <li className={cn({ [styles.res]: order.enhancedPrivacy })}>
            {toDecimalPlaces(Decimal(order.quoteCurrencyAmount))}&nbsp;
            {order.quoteCurrency}
            <hr />
            <span>{this.getMaxPayoutCaption()}</span>
          </li>
          <li>
            {t(`DEX Fee`)}
            <hr />
            <span>{RESDEX.dexFee.toFixed(2)}%</span>
          </li>
          <li>
            {t(`{{symbol}} Fee`, { symbol: order.quoteCurrency })}
            <hr />
            <span>{txFee && txFee.toString()}</span>
          </li>
          <li>
            {t(`Max. Total Payout`)}
            <hr />
            <span>{this.getMaxPayoutCaption()}</span>
          </li>
        </ul>

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
	orders: state.resDex.orders,
  accounts: state.resDex.accounts
})

export default connect(mapStateToProps, null)(translate('resdex')(OrderSummary))
