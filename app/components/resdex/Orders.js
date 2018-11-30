// @flow
import { Decimal } from 'decimal.js'
import moment from 'moment'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'
import cn from 'classnames'
import { translate } from 'react-i18next'

import { getOrderStatusName } from '~/utils/resdex'
import { toDecimalPlaces } from '~/utils/decimal'
import { ResDexActions } from '~/reducers/resdex/resdex.reducer'
import { ResDexOrdersActions } from '~/reducers/resdex/orders/reducer'
import { RoundedButton } from '~/components/rounded-form'
import { UniformList, UniformListHeader, UniformListRow, UniformListColumn} from '~/components/uniform-list'

import styles from './Orders.scss'

type Props = {
  t: any,
  i18n: any,
  orders: object,
  actions: object,
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
        <UniformListColumn width="10%">{t(`Private`)}</UniformListColumn>
        <UniformListColumn width="21%">{t(`Status`)}</UniformListColumn>
      </UniformListHeader>
    )
  }

  getBaseCurrencyAmount(order) {
    let baseCurrencyAmount = null

    if (!order.isPrivate) {
      ({ baseCurrencyAmount } = order)
    } else if (order.privacy.baseResOrderUuid) {
      const { swapHistory } = this.props.orders
      const baseResOrder = swapHistory[order.privacy.baseResOrderUuid]
      ({ baseCurrencyAmount } = baseResOrder || {})
    }

    if (!baseCurrencyAmount) {
      baseCurrencyAmount = order.privacy.expectedBaseCurrencyAmount
    }

    return Decimal(baseCurrencyAmount)
  }

	/**
   * @memberof ResDexOrders
	 */
  getListRowRenderer(order) {
    const { i18n } = this.props

    const { baseCurrency, quoteCurrency, status } = order.isPrivate ? order.privacy : order

    return (
      <UniformListRow
        className={styles.row}
        key={order.uuid}
        onClick={() => this.props.actions.showOrderModal(order.uuid)}
      >
        <UniformListColumn className={styles.time}>
          {moment(order.timeStarted).locale(i18n.language).format('kk:mm L')}
        </UniformListColumn>
        <UniformListColumn>
          {baseCurrency}/{quoteCurrency}
        </UniformListColumn>
        <UniformListColumn className={cn(styles.amount, styles.lesser)}>
          -{toDecimalPlaces(Decimal(order.quoteCurrencyAmount))} {quoteCurrency}
        </UniformListColumn>
        <UniformListColumn className={cn(styles.amount, styles.greater)}>
          {toDecimalPlaces(this.getBaseCurrencyAmount(order))} {baseCurrency}
        </UniformListColumn>
        <UniformListColumn>
          <i className={cn('icon', styles.private, { [styles.enabled]: order.isPrivate })} />
        </UniformListColumn>
        <UniformListColumn>
          <span className={cn(styles.status, styles[status])}>
            {getOrderStatusName(order)}
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

    const status = swap => swap.isPrivate ? swap.privacy.status : swap.status
    const completed = swap => ['completed', 'failed'].includes(status(swap))

    const openOrders = swapHistory.filter(swap => !completed(swap))
    const completedOrders = swapHistory.filter(swap => completed(swap))

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

            <RoundedButton onClick={() => this.props.resDexActions.selectTab(1)} important large>
              {t(`Open an order`)}
            </RoundedButton>
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

            <RoundedButton onClick={() => this.props.resDexActions.selectTab(1)} important large>
              {t(`Open an order`)}
            </RoundedButton>
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
