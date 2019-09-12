import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'
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
  i18n: any,
  baseCurrency: string,
  quoteCurrency: string,
  resDex: ResDexState,
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
        <UniformListColumn width="25%">{quoteCurrency}</UniformListColumn>
        <UniformListColumn width="25%">{baseCurrency}</UniformListColumn>
        <UniformListColumn width="10%">{t(`Time`)}</UniformListColumn>
      </UniformListHeader>
    )
  }

  getListRowRenderer(trade) {
    const { i18n } = this.props

    return (
      <UniformListRow className={styles.row}>
        <UniformListColumn className={cn(styles.column, {
          [styles.green]: trade.isAscending,
          [styles.red]: !trade.isAscending
        })}>
          {toDecimalPlaces(trade.price, 8)}
        </UniformListColumn>
        <UniformListColumn className={styles.column}>
          {toDecimalPlaces(trade.quoteAmount, 4)}
        </UniformListColumn>
        <UniformListColumn className={styles.column}>
          {toDecimalPlaces(trade.baseAmount, 4)}
        </UniformListColumn>
        <UniformListColumn
          className={styles.column}
          tooltip={moment(trade.time).locale(i18n.language).format('L kk:mm')}
        >
          {moment(trade.time).format('HH:mm:ss')}
        </UniformListColumn>
      </UniformListRow>
    )
  }

	render() {
    const { t, trades } = this.props

    const { baseCurrency, quoteCurrency } = this.props.resDex.buySell.tradesPair
    const { baseCurrency: base, quoteCurrency: rel } = this.props
    const isLoading = baseCurrency !== base || quoteCurrency !== rel

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
            rowRenderer={(item, index) => this.getListRowRenderer(item, index)}
            emptyMessage={t(`No market trades available yet`)}
            scrollable
            loading={isLoading}
          />

        </div>
    )
  }
}

const mapStateToProps = state => ({
	resDex: state.resDex,
})

export default connect(mapStateToProps, null)(translate('resdex')(Trades))
