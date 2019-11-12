// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'
import cn from 'classnames'
import log from 'electron-log'

import { toDecimalPlaces, toMaxDigits } from '~/utils/decimal'
import {
  UniformList,
  UniformListHeader,
  UniformListRow,
  UniformListColumn
} from '~/components/uniform-list'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'

import styles from './OrderBook.scss'

type Props = {
  t: any,
  resDex: ResDexState,
  className?: string,
  baseCurrency: string,
  quoteCurrency: string,
  baseSmartAddress: string | null,
  quoteSmartAddress: string | null,
  orderBook: object,
  onPickPrice: () => void
}

/**
 * @class OrderBook
 * @extends {Component<Props>}
 */
class OrderBook extends Component<Props> {
	props: Props

  getListHeaderRenderer() {
    const { t } = this.props
    const { baseCurrency, quoteCurrency } = this.props.resDex.buySell

    return (
      <UniformListHeader>
        <UniformListColumn width="33%">{t(`Price`)}</UniformListColumn>
        <UniformListColumn width="33%">{quoteCurrency}</UniformListColumn>
        <UniformListColumn width="33%">{baseCurrency}</UniformListColumn>
        {/*
        <UniformListColumn width="30%">{t(`Sum ({{symbol}})`, { symbol: baseCurrency })}</UniformListColumn>
        */}
      </UniformListHeader>
    )
  }

  onRowClick(event, price) {
    event.stopPropagation()
    this.props.onPickPrice(price)
    return false
  }

  getListRowRenderer(order, smartAddress, isAsk) {
    const { baseSmartAddress, quoteSmartAddress } = this.props

    return (
      <UniformListRow
        className={cn(styles.row, { [styles.myOrder]: [baseSmartAddress, quoteSmartAddress].includes(order.address) })}
        onClick={e => this.onRowClick(e, order.price)}
      >
        <UniformListColumn className={cn(styles.column, {
            [styles.red]: isAsk,
            [styles.green]: !isAsk
          })}
          tooltip={toDecimalPlaces(order.price, 8)}
        >
          {toMaxDigits(order.price, 8)}
        </UniformListColumn>
        <UniformListColumn
          className={styles.column}
        >
          {isAsk
            ? toMaxDigits(order.maxVolume.times(order.price), 8)
            : toMaxDigits(order.maxVolume, 8)
          }
        </UniformListColumn>
        <UniformListColumn
          className={styles.column}
        >
          {isAsk
            ? toMaxDigits(order.maxVolume, 8)
            : toMaxDigits(order.maxVolume.dividedBy(order.price), 8)
          }
        </UniformListColumn>
        {/*
        <UniformListColumn>
          {toDecimalPlaces(order.depth, 4)}
        </UniformListColumn>
        */}
      </UniformListRow>
    )
  }

	render() {
    const { t } = this.props

    const { baseCurrency, quoteCurrency } = this.props.resDex.buySell
    const { baseCurrency: base, quoteCurrency: rel, baseQuote } = this.props.resDex.buySell.orderBook

    log.debug(baseCurrency, quoteCurrency, base, rel)
    const isLoading = baseCurrency !== base || quoteCurrency !== rel

    return (
      <div className={cn(styles.orderBook, this.props.className)}>
        <div className={styles.asks}>
          <div className={styles.title}>
            <div className={cn('icon', styles.asksIcon)} />
            {t(`Asks`)}
          </div>

          <UniformList
            className={styles.list}
            items={(baseQuote.asks || []).slice().reverse()}
            headerRenderer={() => this.getListHeaderRenderer()}
            rowRenderer={item => this.getListRowRenderer(item, this.props.baseSmartAddress, true)}
            emptyMessage={t(`No liquidity available yet`)}
            loading={isLoading}
            scrollable
          />

        </div>
        <div className={styles.bids}>
          <div className={styles.title}>
            <div className={cn('icon', styles.bidsIcon)} />
            {t(`Bids`)}
          </div>

          <UniformList
            className={styles.list}
            items={baseQuote.bids}
            headerRenderer={() => this.getListHeaderRenderer()}
            rowRenderer={item => this.getListRowRenderer(item, this.props.quoteSmartAddress, false)}
            emptyMessage={t(`No liquidity available yet`)}
            loading={isLoading}
            scrollable
          />

        </div>

      </div>
    )
  }
}

const mapStateToProps = state => ({
	resDex: state.resDex,
})

export default connect(mapStateToProps, null)(translate('resdex')(OrderBook))
