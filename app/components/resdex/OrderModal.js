// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexOrdersActions } from '~/reducers/resdex/orders/reducer'
import OrderSummary from './OrderSummary'

import styles from './OrderModal.scss'

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

	render() {
    const { t } = this.props

    const { uuid } = this.props.orders.orderModal
    const order = {
      ...this.props.orders.swapHistory.find(swap => swap.uuid === uuid),
      enhancedPrivacy: false,
    }

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
            </div>

          </div>

          <ul className={styles.stagesContainer}>
            <li className={styles.active}>
              {t(`My fee`)}
            </li>
            <li>
              {t(`My deposit`)}
            </li>
            <li>
              {t(`Their deposit`)}
            </li>
            <li>
              {t(`My payment`)}
            </li>
            <li>
              {t(`Their spend`)}
            </li>
          </ul>

          <div className={styles.summaryContainer}>
            <OrderSummary className={styles.summary} order={order} />
          </div>

          <div className={styles.id}>
            ID: {uuid}
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
