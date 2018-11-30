// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { getOrderStatusName } from '~/utils/resdex'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexOrdersActions } from '~/reducers/resdex/orders/reducer'
import OrderSummary from './OrderSummary'

import styles from './OrderModal.scss'
import orderStyles from './Orders.scss'

type Props = {
  t: any,
  orders: ResDexState.orders,
  actions: object
}

/**
 * @class OrderModal
 * @extends {Component<Props>}
 */
class OrderModal extends Component<Props> {
	props: Props

  getOrder(): object | null {
    const { uuid } = this.props.orders.orderModal
    const order = this.props.orders.swapHistory.find(swap => swap.uuid === uuid)
    return order || null
  }

  getIsStageComplete(stage: string): boolean {
    const order = this.getOrder()

    if (!order || !order.transactions) {
      return false
    }

    return Boolean(order.transactions.find(chainStage => chainStage.stage === stage))
  }

	render() {
    const { t } = this.props

    const order = this.getOrder()
    const status = order.isPrivate ? order.privacy.status : order.status

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.order)}>
          <div className={styles.titleContainer}>
            <div
              role="button"
              tabIndex={0}
              className={cn('icon', styles.closeButton)}
              onClick={this.props.actions.closeOrderModal}
              onKeyDown={() => {}}
            />

            <div className={styles.title}>
              {t(`{{pair}} Buy Order`, { pair: `${order.baseCurrency}/${order.quoteCurrency}` })}

              {order.status &&
                <div className={styles.statusContainer}>
                  <div className={cn(orderStyles.status, orderStyles[status])}>
                    {getOrderStatusName(order)}
                  </div>
                </div>
              }
            </div>

          </div>

          <ul className={cn(styles.stagesContainer, styles.slider, {[styles.close]: status === 'privatizing'})}>
            <li className={cn({ [styles.active]: this.getIsStageComplete('myfee') })}>
              {t(`My fee`)}
            </li>
            <li className={cn({ [styles.active]: this.getIsStageComplete('bobdeposit') })}>
              {t(`My deposit`)}
            </li>
            <li className={cn({ [styles.active]: this.getIsStageComplete('alicepayment') })}>
              {t(`Their deposit`)}
            </li>
            <li className={cn({ [styles.active]: this.getIsStageComplete('bobpayment') })}>
              {t(`My payment`)}
            </li>
            <li className={cn({ [styles.active]: this.getIsStageComplete('alicespend') })}>
              {t(`Their spend`)}
            </li>
          </ul>

          <div className={styles.summaryContainer}>
            <OrderSummary className={styles.summary} order={order} />
          </div>

          <div className={styles.id}>
            ID: {order.uuid}
          </div>

      </div>
    </div>
    )
  }
}

const mapStateToProps = (state) => ({
	orders: state.resDex.orders
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexOrdersActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(OrderModal))
