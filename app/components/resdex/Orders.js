// @flow
import moment from 'moment'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'
import cn from 'classnames'
import { translate } from 'react-i18next'
import { toastr } from 'react-redux-toastr'

import { getOrderStatusName } from '~/utils/resdex'
import { toDecimalPlaces } from '~/utils/decimal'
import { ResDexActions } from '~/reducers/resdex/resdex.reducer'
import { ResDexOrdersActions } from '~/reducers/resdex/orders/reducer'
import { RoundedButton, BorderlessButton } from '~/components/rounded-form'
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
        <UniformListColumn width="17%">{t(`Time`)}</UniformListColumn>
        <UniformListColumn width="11%">{t(`Pair`)}</UniformListColumn>
        <UniformListColumn width="10%">{t(`Type`)}</UniformListColumn>
        <UniformListColumn width="16%">{t(`Amount out`)}</UniformListColumn>
        <UniformListColumn width="16%">{t(`Amount in`)}</UniformListColumn>
        <UniformListColumn width="10%">{t(`Private`)}</UniformListColumn>
        <UniformListColumn width="20%">{t(`Status`)}</UniformListColumn>
      </UniformListHeader>
    )
  }

  onClearHistoryClick() {
    const { t } = this.props

    const clearHistory = () => {
      // TODO: Figure out if we need this after ResDEX 2 integration
      // const { swapHistory } = this.props.orders
      // swapHistory.filter(swap => !swap.isActive).forEach(swap => swapDB.removeSwap(swap.uuid))
      toastr.success(t(`Swap history removed`))
    }

    const confirmOptions = { onOk: () => clearHistory() }
    toastr.confirm(t(`Are you sure want to clear the swap history?`), confirmOptions)
  }

	/**
   * @memberof ResDexOrders
	 */
  getListRowRenderer(order) {
    const { i18n, t } = this.props

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
          {order.baseCurrency}/{order.quoteCurrency}
        </UniformListColumn>
        <UniformListColumn>
          {order.isMarket ? t(`Market`) : t(`Limit`)}
        </UniformListColumn>
        <UniformListColumn className={cn(styles.amount, styles.lesser)}>
          -{toDecimalPlaces(order.quoteCurrencyAmount)} {order.quoteCurrency}
        </UniformListColumn>
        <UniformListColumn className={cn(styles.amount, styles.greater)}>
          {toDecimalPlaces(order.baseCurrencyAmount)} {order.baseCurrency}
        </UniformListColumn>
        <UniformListColumn>
          <i className={cn('icon', styles.private, { [styles.enabled]: order.isPrivate })} />
        </UniformListColumn>
        <UniformListColumn>
          <span className={cn(styles.status, styles[order.status])}>
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
    const completed = swap => ['completed', 'failed', 'cancelled'].includes(status(swap))

    const visibleSwapHistory = swapHistory.filter(swap => swap.isHidden === false)
    const openOrders = visibleSwapHistory.filter(swap => !completed(swap))
    const completedOrders = visibleSwapHistory.filter(swap => completed(swap))

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

        <div className={styles.header}>
          {t(`Swap history`)}

          {false && completedOrders.length !== 0 &&
            <BorderlessButton
              className={styles.clearHistoryButton}
              onClick={() => this.onClearHistoryClick()}
            >
              {t(`Clear history`)}
            </BorderlessButton>
          }

        </div>

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
