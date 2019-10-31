// @flow
import { Decimal } from 'decimal.js'
import { Component } from 'react'

import { RESDEX } from '~/constants/resdex'
import { toDecimalPlaces } from '~/utils/decimal'


/**
 * @class BuySellFormMixin
 * @extends {Component<Props>}
 */
class BuySellFormMixin extends Component<Props> {
  getMaxQuoteAmount() {
    const { quoteCurrency } = this.props.buySell
    const currency = this.props.accounts.currencies.RESDEX[quoteCurrency]
    if (!currency) {
      return Decimal(0)
    }
    const maxAmount = currency.balance.minus(currency.lockedAmount)
    return maxAmount.times(Decimal(1).minus(RESDEX.dexFee.dividedBy(Decimal(100))))
  }

  getBestPrice(): object | null {
    const { orderBook } = this.props.buySell
    const { asks  } = orderBook.baseQuote
    return asks.length ? asks[0].price : null
  }

  getBaseResEquivalent() {
    const { quoteCurrency } = this.props.buySell
    const { orderBook } = this.props.buySell

    if (!this.props.form) {
      return null
    }

    const { maxRel } = this.props.form.fields

    if (!maxRel) {
      return null
    }

    if (quoteCurrency === 'RES') {
      return Decimal(maxRel)
    }

    if (!orderBook.resQuote.asks.length) {
      return null
    }

    const resAmount = Decimal(maxRel).dividedBy(orderBook.resQuote.asks[0].price)

    return resAmount
  }

  getZCreditsBaseEquivalentCaption() {
    const { baseCurrency } = this.props.buySell
    const { orderBook } = this.props.buySell

    const baseRes = this.getBaseResEquivalent()

    if (baseRes === null) {
      return null
    }

    const { zCredits } = this.props.accounts

    if (zCredits === null) {
      return null
    }

    let priceInRes = Decimal(1)

    if (baseCurrency !== 'RES') {
      if (!orderBook.baseRes.bids.length) {
        return null
      }

      const baseAmount = baseRes.dividedBy(orderBook.baseRes.bids[0].price)

      priceInRes = baseRes.dividedBy(baseAmount)
    }

    const amount = zCredits.dividedBy(priceInRes)

    return `${toDecimalPlaces(amount)} ${baseCurrency}`
  }

  getIsInstantSwapAllowed(): boolean {
    const { zCredits } = this.props.accounts
    const resBase = this.getBaseResEquivalent()

    if (zCredits == null || resBase  === null || resBase.isZero()) {
      return false
    }

    const dynamicTrust = zCredits.minus(resBase.times(Decimal('1.05')))
    return dynamicTrust.greaterThanOrEqualTo(Decimal(0))
  }

  getOrderAttributes() {
    const { form, isAdvanced } = this.props
    const isMarket = form && form.fields.isMarketOrder || !isAdvanced
    const isPrivate = Boolean(form && form.fields.enhancedPrivacy && isMarket)
    return {
      isMarket,
      isPrivate
    }
  }

  // Can't create a market order if there's no liquidity or when sending an order
  getSubmitButtonDisabledAttribute() {
    const { swapHistory } = this.props.orders
    const { baseCurrency, quoteCurrency, orderBook, isSendingOrder } = this.props.buySell

    const orderAttrs = this.getOrderAttributes()

    if (!orderAttrs.isMarket) {
      return isSendingOrder
    }

    const arePendingPrivateOrdersPresent = swapHistory.filter(
      swap => swap.isPrivate &&
      !['completed', 'failed', 'cancelled'].includes(swap.privacy.status)
    ).length

    const areAllAsksPresent = orderAttrs.isPrivate
      ? orderBook.resQuote.asks.length && orderBook.baseRes.asks.length
      : orderBook.baseQuote.asks.length

    return (
      isSendingOrder
      || orderBook.baseCurrency !== baseCurrency
      || orderBook.quoteCurrency !== quoteCurrency
      || !areAllAsksPresent
      || arePendingPrivateOrdersPresent
    )

  }
}

export default BuySellFormMixin
