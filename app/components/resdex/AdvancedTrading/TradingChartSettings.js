import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import cn from 'classnames'
import { translate } from 'react-i18next'

import { PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'
import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'

import styles from './TradingChartSettings.scss'

const drawPopupMenuId = 'resdex-buy-sell-chart-draw-popup-menu-id'
const chartTypePopupMenuId = 'resdex-buy-sell-chart-type-popup-menu-id'

type Props = {
  t: any,
  resDex: ResDexState,
  actions: object,
  popupMenuActions: object
}

const getPeriodCaption = (t, period) => ({
  hour: t(`1H`),
  day: t(`1D`),
  week: t(`1W`),
  month: t(`1M`),
  year: t(`1Y`),
  all: t(`All`),
})[period]

/**
 * @class TradingChartSettings
 * @extends {Component<Props>}
 */
class TradingChartSettings extends Component<Props> {

  render() {
    const { t } = this.props
    const { updateInteractiveMode } = this.props.actions
    const { tradingChart: chartSettings } = this.props.resDex.buySell
    const chartPeriods = ['hour', 'day', 'week', 'month', 'year']
    const { updateChartSettings, updateChartPeriod } = this.props.actions
    const { type: chartType, interactiveMode } = chartSettings

    return (
      <div className={styles.container}>
        <div
          role="button"
          className={styles.button}
          onClick={() => this.props.popupMenuActions.show(drawPopupMenuId)}
          tabIndex={-1}
          onKeyDown={() => false}
        >
          <div className={styles.label}>
            {t(`Draw`)}
          </div>

          <PopupMenu
            id={drawPopupMenuId}
            className={styles.popupMenu}
            relative
          >
            <PopupMenuItem onClick={() => updateInteractiveMode(null)}>
              <div className={cn(styles.item, {[styles.active]: interactiveMode === null})}>
                {t(`Select mode`)}
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateInteractiveMode('trendline')}>
              <div className={cn(styles.item, {[styles.active]: interactiveMode === 'trendline'})}>
                {t(`Trendline`)}
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateInteractiveMode('fibonacci')}>
              <div className={cn(styles.item, {[styles.active]: interactiveMode === 'fibonacci'})}>
                {t(`Fibonacci Retracement`)}
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateInteractiveMode('standardDeviation')} disabled>
              <div className={cn(styles.item, {[styles.active]: interactiveMode === 'standardDeviation'})}>
                {t(`Standard Deviation Channel`)}
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateInteractiveMode('gannFan')} disabled>
              <div className={cn(styles.item, {[styles.active]: interactiveMode === 'gannFan'})}>
                {t(`Gann Fan`)}
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateInteractiveMode('label')} disabled>
              <div className={cn(styles.item, {[styles.active]: interactiveMode === 'label'})}>
                {t(`Label`)}
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateInteractiveMode('alert')} disabled>
              <div className={cn(styles.item, {[styles.active]: interactiveMode === 'alert'})}>
                {t(`Alert`)}
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateInteractiveMode('brush')} disabled>
              <div className={cn(styles.item, {[styles.active]: interactiveMode === 'brush'})}>
                {t(`Brush`)}
              </div>
            </PopupMenuItem>
          </PopupMenu>

        </div>
        <div
          role="button"
          className={styles.button}
          onClick={() => this.props.popupMenuActions.show(chartTypePopupMenuId)}
          tabIndex={-1}
          onKeyDown={() => false}
        >
          <div className={styles.label}>
            {t(`Chart`)}
          </div>

          <PopupMenu
            id={chartTypePopupMenuId}
            className={styles.popupMenu}
            relative
          >
            <PopupMenuItem onClick={() => updateChartSettings({type: 'candlestick'})}>
              <div className={cn(styles.item, {[styles.active]: chartType === 'candlestick'})}>
                {t(`Candlestick`)}
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateChartSettings({type: 'heikin-ashi'})}>
              <div className={cn(styles.item, {[styles.active]: chartType === 'heikin-ashi'})}>
                {t(`Heikin Ashi`)}
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateChartSettings({type: 'kagi'})}>
              <div className={cn(styles.item, {[styles.active]: chartType === 'kagi'})}>
                {t(`Kagi`)}
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateChartSettings({type: 'point-figure'})}>
              <div className={cn(styles.item, {[styles.active]: chartType === 'point-figure'})}>
                {t(`Point & Figure`)}
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateChartSettings({type: 'renko'})}>
              <div className={cn(styles.item, {[styles.active]: chartType === 'renko'})}>
                {t(`Renko`)}
              </div>
            </PopupMenuItem>
          </PopupMenu>

        </div>

        <div
          role="button"
          className={styles.button}
          onClick={this.props.actions.showIndicatorsModal}
          tabIndex={0}
          onKeyDown={() => false}
        >
          <div className={styles.label}>
            {t(`Indicators`)}
          </div>

        </div>

        <ul className={styles.period}>
          {chartPeriods.map((period, index) => (
            <li
              role="none"
              key={period}
              tabIndex={index + 1}
              className={cn({ [styles.active]: period === chartSettings.period })}
              onClick={() => updateChartPeriod(period)}
              onKeyDown={() => updateChartPeriod(period)}

            >
              {getPeriodCaption(t, period)}
            </li>
          ))}
        </ul>

    </div>
    )
  }
}

const mapStateToProps = (state) => ({
	resDex: state.resDex,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexBuySellActions, dispatch),
  popupMenuActions: bindActionCreators(PopupMenuActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(TradingChartSettings))
