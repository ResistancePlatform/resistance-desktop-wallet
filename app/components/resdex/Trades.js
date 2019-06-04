import moment from 'moment'
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

import styles from './Trades.scss'

type Props = {
  t: any,
  baseCurrency: string,
  quoteCurrency: string,
  trades: object
}

/**
 * @class Trades
 * @extends {Component<Props>}
 */
class Trades extends Component<Props> {
	props: Props

  getListHeaderRenderer() {
    const { t } = this.props
    const { baseCurrency, quoteCurrency } = this.props

    return (
      <UniformListHeader>
        <UniformListColumn width="30%">{t(`Price`)}</UniformListColumn>
        <UniformListColumn width="20%">{quoteCurrency}</UniformListColumn>
        <UniformListColumn width="20%">{baseCurrency}</UniformListColumn>
        <UniformListColumn width="20%">{t(`Time`)}</UniformListColumn>
      </UniformListHeader>
    )
  }

  getListRowRenderer(trade) {
    return (
      <UniformListRow>
        <UniformListColumn>
          {toDecimalPlaces(trade.price, 4)}
        </UniformListColumn>
        <UniformListColumn>
          {toDecimalPlaces(trade.quoteAmount)}
        </UniformListColumn>
        <UniformListColumn>
          {toDecimalPlaces(trade.baseAmount)}
        </UniformListColumn>
        <UniformListColumn>
          {moment(trade.time).format('HH:mm:ss')}
        </UniformListColumn>
      </UniformListRow>
    )
  }
	render() {
    const { t, trades } = this.props

    return (
        <div className={styles.trades}>
          <div className={styles.title}>
            <div className={cn('icon', styles.bidsIcon)} />
            {t(`Trades`)}
          </div>

          <UniformList
            className={styles.list}
            items={trades}
            headerRenderer={() => this.getListHeaderRenderer()}
            rowRenderer={item => this.getListRowRenderer(item)}
            emptyMessage={t(`No market trades available yet`)}
          />

        </div>
    )
  }
}

export default translate('resdex')(Trades)
