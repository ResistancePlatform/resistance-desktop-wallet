// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { toDecimalPlaces } from '~/utils/decimal'
import {
  UniformList,
  UniformListHeader,
  UniformListRow,
  UniformListColumn
} from '~/components/uniform-list'

import styles from './OrderBook.scss'

type Props = {
  t: any,
  baseCurrency: string,
  quoteCurrency: string,
  orderBook: object
}

/**
 * @class OrderBook
 * @extends {Component<Props>}
 */
class OrderBook extends Component<Props> {
	props: Props

  getListHeaderRenderer() {
    const { t } = this.props
    const { baseCurrency, quoteCurrency } = this.props

    return (
      <UniformListHeader>
        <UniformListColumn width="30%">{t(`Price`)}</UniformListColumn>
        <UniformListColumn width="20%">{quoteCurrency}</UniformListColumn>
        <UniformListColumn width="20%">{baseCurrency}</UniformListColumn>
        <UniformListColumn width="30%">{t(`Sum ({{symbol}})`, { symbol: baseCurrency })}</UniformListColumn>
      </UniformListHeader>
    )
  }

  getListRowRenderer(order) {
    return (
      <UniformListRow>
        <UniformListColumn>
          {toDecimalPlaces(order.price, 8)}
        </UniformListColumn>
        <UniformListColumn>
          {toDecimalPlaces(order.maxVolume, 8)}
        </UniformListColumn>
        <UniformListColumn>
          {toDecimalPlaces(order.maxVolume.times(order.price), 8)}
        </UniformListColumn>
        <UniformListColumn>
          {toDecimalPlaces(order.depth, 8)}
        </UniformListColumn>
      </UniformListRow>
    )
  }

	render() {
    const { t } = this.props
    const { asks, bids } = this.props.orderBook

    return (
      <div className={styles.orderBook}>
        <div className={styles.asks}>
          <div className={styles.title}>
            <div className={cn('icon', styles.asksIcon)} />
            {t(`Asks`)}
          </div>

          <UniformList
            className={styles.list}
            items={asks}
            headerRenderer={() => this.getListHeaderRenderer()}
            rowRenderer={item => this.getListRowRenderer(item)}
            emptyMessage={t(`No liquidity available`)}
          />

        </div>
        <div className={styles.bids}>
          <div className={styles.title}>
            <div className={cn('icon', styles.bidsIcon)} />
            {t(`Bids`)}
          </div>

          <UniformList
            className={styles.list}
            items={bids}
            headerRenderer={() => this.getListHeaderRenderer()}
            rowRenderer={item => this.getListRowRenderer(item)}
            emptyMessage={t(`No liquidity available`)}
          />

        </div>

      </div>
    )
  }
}

export default translate('resdex')(OrderBook)
