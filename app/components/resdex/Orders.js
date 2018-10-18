// @flow
import { Decimal } from 'decimal.js'
import moment from 'moment'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'
import cn from 'classnames'
import { translate } from 'react-i18next'

import { toDecimalPlaces } from '~/utils/decimal'
import { ResDexActions } from '~/reducers/resdex/resdex.reducer'
import { ResDexOrdersActions } from '~/reducers/resdex/orders/reducer'
import { UniformList, UniformListHeader, UniformListRow, UniformListColumn} from '~/components/uniform-list'

import styles from './Orders.scss'

const getOrderStatusName = (t, status: string) => ({
  pending: t(`Pending`),
  completed: t(`Completed`),
  matched: t(`Matched`),
  swapping: t(`Swapping`),
  unmatched: t(`Unmatched`),
  failed: t(`Failed`),
}[status] || status)

type Props = {
  t: any,
  i18n: any,
  orders: object,
  resDexActions: object
}


/**
 * @class ResDexOrders
 * @extends {Component<Props>}
 */
class ResDexOrders extends Component<Props> {
	props: Props

	/**
   * @memberof ResDexOrders
	 */
  getListHeaderRenderer() {
    const { t } = this.props

    return (
      <UniformListHeader>
        <UniformListColumn width="18%">{t(`Time`)}</UniformListColumn>
        <UniformListColumn width="17%">{t(`Pair`)}</UniformListColumn>
        <UniformListColumn width="17%">{t(`Amount out`)}</UniformListColumn>
        <UniformListColumn width="17%">{t(`Amount in`)}</UniformListColumn>
        <UniformListColumn width="14%">{t(`Private`)}</UniformListColumn>
        <UniformListColumn width="17%">{t(`Status`)}</UniformListColumn>
      </UniformListHeader>
    )
  }

	/**
   * @memberof ResDexOrders
	 */
  getListRowRenderer(order) {
    const { t, i18n } = this.props

    return (
      <UniformListRow className={styles.row} key={order.id}>
        <UniformListColumn className={styles.time}>
          {moment(order.timeStarted).locale(i18n.language).format('kk:mm L')}
        </UniformListColumn>
        <UniformListColumn>
          {order.baseCurrency}/{order.quoteCurrency}
        </UniformListColumn>
        <UniformListColumn className={cn(styles.amount, styles.lesser)}>
          -{toDecimalPlaces(Decimal(order.quoteCurrencyAmount))} {order.quoteCurrency}
        </UniformListColumn>
        <UniformListColumn className={cn(styles.amount, styles.greater)}>
          {toDecimalPlaces(Decimal(order.baseCurrencyAmount))} {order.baseCurrency}
        </UniformListColumn>
        <UniformListColumn>
          <i className={cn('icon', styles.private, { [styles.enabled]: order.isPrivate })} />
        </UniformListColumn>
        <UniformListColumn>
          <span className={cn(styles.status, styles[order.status])}>
            {getOrderStatusName(t, order.status)}
          </span>
        </UniformListColumn>
      </UniformListRow>
    )
  }

	/**
	 * @returns
   * @memberof ResDexOrders
	 */
	render() {
    const { t } = this.props
    const { swapHistory } = this.props.orders

    const completed = status => ['completed', 'failed'].includes(status)
    const openOrders = swapHistory.filter(swap => !completed(swap.status))
    const completedOrders = swapHistory.filter(swap => completed(swap.status))

		return (
      <div className={cn(styles.container)}>
        <div className={styles.header}>{t(`Open orders`)}</div>

        <UniformList
          className={styles.list}
          items={openOrders}
          headerRenderer={() => this.getListHeaderRenderer()}
          rowRenderer={openOrder => this.getListRowRenderer(openOrder)}
          emptyMessage={false}
        />

        {!openOrders.length &&
          <div className={styles.noOrders}>
            <div>{t(`You have no orders yet`)}</div>

            <button type="button" onClick={() => this.props.resDexActions.selectTab(1)}>
              {t(`Open an order`)}
            </button>
          </div>
        }

        <div className={styles.header}>{t(`Swap history`)}</div>

        <UniformList
          className={styles.list}
          items={completedOrders}
          headerRenderer={() => this.getListHeaderRenderer()}
          rowRenderer={completedOrder => this.getListRowRenderer(completedOrder)}
          emptyMessage={false}
        />

        {!completedOrders.length &&
          <div className={styles.noOrders}>
            <div>{t(`You have no swap history yet`)}</div>

            <button type="button" onClick={() => this.props.resDexActions.selectTab(1)}>
              {t(`Open an order`)}
            </button>
          </div>
        }

      </div>
    )
  }
}

const mapStateToProps = state => ({
  orders: state.resDex.orders
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexOrdersActions, dispatch),
  resDexActions: bindActionCreators(ResDexActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(ResDexOrders))
