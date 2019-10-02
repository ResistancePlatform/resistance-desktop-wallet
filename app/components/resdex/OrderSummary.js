// @flow
import { Decimal } from 'decimal.js'
import log from 'electron-log'
import { shell } from 'electron'
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
    quoteCurrencyAmount: object,
    price: object | null,
    baseCurrency: string,
    quoteCurrency: string,
    isPrivate: boolean
  },
  accounts: ResDexState.accounts,
  flipPrice?: boolean
}

/**
 * @class OrderSummary
 * @extends {Component<Props>}
 */
class OrderSummary extends Component<Props> {
	props: Props

  getCorrectedPrice() {
    const { price } = this.props.order

    if (price === null || price.isZero()) {
      return price
    }

    const { flipPrice } = this.props
    const newPrice = flipPrice
      ? Decimal(1).dividedBy(price)
      : price
    return newPrice
  }

  getTxFee(): Decimal | null {
    const { quoteCurrency } = this.props.order
    const txFee = this.props.accounts.currencyFees[quoteCurrency] || null
    return txFee
  }

  getBaseAmount(): Decimal | null {
    const { quoteCurrencyAmount } = this.props.order
    const price = this.getCorrectedPrice()
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
    const { baseCurrency, quoteCurrency } = this.props.order
    const price = this.getCorrectedPrice()

    if (price === null) {
      return t(`No liquidity available yet`)
    }

    return t(`@ {{price}} {{quoteCurrency}} per {{baseCurrency}}`, {
      price: truncateAmount(Decimal(price)),
      baseCurrency,
      quoteCurrency
    })

  }

  // TODO: Cover all coins here or create a custom block explorer
  getBlockExplorerUrl(symbol: string, txId?: string | null): string | null {
    let blockExplorerUrl

    if (!txId) {
      return null
    }

    switch (symbol) {
      case 'MONA':
        blockExplorerUrl = `https://bchain.info/${symbol.toLowerCase()}/tx/${txId}`
        break
      default:
        blockExplorerUrl = `https://chainz.cryptoid.info/${symbol.toLowerCase()}/tx.dws?${txId}.htm`
    }

    return blockExplorerUrl
  }

  onLinkClick(event) {
    event.preventDefault()
    event.stopPropagation()

    const { order } = this.props

    log.debug('Link clicked', order.txId, order.destinationTxId, event.target.href)
    if (!order.txId) {
      return false
    }

    shell.openExternal(event.target.href)
    return false
  }

  getBriefCaption(): string {
    const { order, t } = this.props

    if (order.isActive || !order.status) {
      return t(`You are sending`)
    }

    if (['cancelled', 'failed'].includes(order.status)) {
      return t(`You were sending`)
    }

    if (order.status === 'completed') {
      return t(`You have sent`)
    }

    return t(`N/A`)
  }

	render() {
    const { order, t } = this.props
    const txFee = this.getTxFee()

    const quoteBlockExplorerUrl = this.getBlockExplorerUrl(order.quoteCurrency, order.quoteTxId)
    const baseBlockExplorerUrl = this.getBlockExplorerUrl(order.baseCurrency, order.baseTxId)

    return (
      <div className={cn(styles.container, this.props.className)}>
        <div className={styles.briefContainer}>
          <div className={styles.brief}>
            {this.getBriefCaption()}
          </div>

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
          <li className={cn({ [styles.res]: order.isPrivate })}>
            <a
              className={cn({[styles.activeLink]: Boolean(quoteBlockExplorerUrl)})}
              href={quoteBlockExplorerUrl}
              onClick={e => this.onLinkClick(e)}
            >
              {toDecimalPlaces(Decimal(order.quoteCurrencyAmount))}&nbsp;
              {order.quoteCurrency}
            </a>
            <hr />
            <span>
              <a
                className={cn({[styles.activeLink]: Boolean(baseBlockExplorerUrl)})}
                href={baseBlockExplorerUrl}
                onClick={e => this.onLinkClick(e)}
              >
                {this.getMaxPayoutCaption()}
              </a>
            </span>
          </li>
          <li>
            {t(`DEX Fee`)}
            <hr />
            <span>{RESDEX.dexFee.toFixed(2)}%</span>
          </li>
          <li>
            {t(`{{symbol}} Fee`, { symbol: order.quoteCurrency })}
            <hr />
            <span>{txFee && `${txFee}`}</span>
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
