// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import TradingChart from './TradingChart'
import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'

import styles from './TradingChartModal.scss'

type Props = {
  t: any,
  resDex: object,
  actions: object
}

/**
 * @class TradingChartModal
 * @extends {Component<Props>}
 */
class TradingChartModal extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props

    const { baseCurrency, quoteCurrency } = this.props.resDex.buySell
    const pair = `${baseCurrency}/${quoteCurrency}`

    return (

      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.tradingChart)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeTradingChartModal}
            onKeyDown={() => false}
          />

          <div className={styles.title}>
            {t(`Trading Chart {{pair}}`, {pair})}
          </div>

          <div className={styles.chartContainer}>
            <TradingChart />
          </div>

      </div>
    </div>
    )
  }
}

const mapStateToProps = state => ({
  resDex: state.resDex,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexBuySellActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(TradingChartModal))
