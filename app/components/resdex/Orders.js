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
        <UniformListColumn width="9%">{t(`Type`)}</UniformListColumn>
        <UniformListColumn width="16%">{t(`Amount out`)}</UniformListColumn>
        <UniformListColumn width="16%">{t(`Amount in`)}</UniformListColumn>
        <UniformListColumn width="9%">{t(`Private`)}</UniformListColumn>
        <UniformListColumn width="14%">{t(`Status`)}</UniformListColumn>
        <UniformListColumn width="8%" />
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

  cancelOrder(uuid: string) {
    const { t } = this.props
    const confirmOptions = { onOk: () => this.props.actions.cancelOrder(uuid) }
    toastr.confirm(t(`Are you sure want to cancel the order?`), confirmOptions)
  }

	/**
   * @memberof ResDexOrders
	 */
  getListRowRenderer(order) {
    const { i18n, t } = this.props

    const { isCancelling } = this.props.orders

    return (
      <UniformListRow
        className={styles.row}
        key={order.uuid}
        onClick={() => order.isSwap ? this.props.actions.showOrderModal(order.uuid) : false}
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
          <span className={cn(styles.status, styles[order.isPrivate ? order.privacy.status : order.status])}>
            {getOrderStatusName(order)}
          </span>
        </UniformListColumn>
        <UniformListColumn>
          {!order.isSwap &&
            <BorderlessButton
              className={styles.cancelButton}
              onClick={() => this.cancelOrder(order.uuid)}
              disabled={!order.isCancellable || isCancelling}
              tooltip={order.isCancellable ? null : t(`The order is not cancellable`)}
            >
              {t(`Cancel`)}
            </BorderlessButton>

          }
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

    const status = o => o.isPrivate ? o.privacy.status : o.status
    const completed = o => ['completed', 'failed', 'cancelled'].includes(status(o))

    const visibleOrders = swapHistory.filter(o => o.isHidden === false)

    const openOrders = visibleOrders.filter(o => !o.isSwap && !completed(o))
    const openSwaps = visibleOrders.filter(o => o.isSwap && !completed(o))
    const completedSwaps = visibleOrders.filter(o => completed(o))

		return (
      <div className={cn(styles.container)}>
        <div className={styles.header}>{t(`Orders`)}</div>

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

        <div className={styles.header}>{t(`Swaps`)}</div>

        <UniformList
          className={styles.list}
          items={openSwaps}
          headerRenderer={() => this.getListHeaderRenderer()}
          rowRenderer={openSwap => this.getListRowRenderer(openSwap)}
          emptyMessage={false}
        />

        {!openSwaps.length &&
          <div className={styles.noOrders}>
            <div>{t(`You have no swaps yet`)}</div>

            <RoundedButton onClick={() => this.props.resDexActions.selectTab(1)} important large>
              {t(`Open an order`)}
            </RoundedButton>
          </div>
        }
        <div className={styles.header}>
          {t(`Swap history`)}

          {false && completedSwaps.length !== 0 &&
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
          items={completedSwaps}
          headerRenderer={() => this.getListHeaderRenderer()}
          rowRenderer={completedOrder => this.getListRowRenderer(completedOrder)}
          emptyMessage={false}
        />

        {!completedSwaps.length &&
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
