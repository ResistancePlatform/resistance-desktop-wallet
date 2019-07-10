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
    const { type: chartType } = chartSettings

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
              <div className={styles.item}>
                <div className={styles.name}>{t(`Select mode`)}</div>
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateInteractiveMode('trendline')}>
              <div className={styles.item}>
                <div className={styles.name}>{t(`Trendline`)}</div>
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateInteractiveMode('fibonacci')} disabled>
              <div className={styles.item}>
                <div className={styles.name}>{t(`Fibonacci Retracement`)}</div>
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateInteractiveMode('standardDeviation')} disabled>
              <div className={styles.item}>
                <div className={styles.name}>{t(`Standard Deviation Channel`)}</div>
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateInteractiveMode('gannFan')} disabled>
              <div className={styles.item}>
                <div className={styles.name}>{t(`Gann Fan`)}</div>
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateInteractiveMode('label')} disabled>
              <div className={styles.item}>
                <div className={styles.name}>{t(`Label`)}</div>
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateInteractiveMode('alert')} disabled>
              <div className={styles.item}>
                <div className={styles.name}>{t(`Alert`)}</div>
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateInteractiveMode('brush')} disabled>
              <div className={styles.item}>
                <div className={styles.name}>{t(`Brush`)}</div>
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
              <div className={styles.item}>
                <div className={styles.name}>{t(`Candlestick`)}</div>
                <div className={cn('icon', styles.check, {[styles.active]: chartType === 'candlestick'})} />
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateChartSettings({type: 'heikin-ashi'})}>
              <div className={styles.item}>
                <div className={styles.name}>{t(`Heikin Ashi`)}</div>
                <div className={cn('icon', styles.check, {[styles.active]: chartType === 'heikin-ashi'})} />
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateChartSettings({type: 'kagi'})}>
              <div className={styles.item}>
                <div className={styles.name}>{t(`Kagi`)}</div>
                <div className={cn('icon', styles.check, {[styles.active]: chartType === 'kagi'})} />
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateChartSettings({type: 'point-figure'})}>
              <div className={styles.item}>
                <div className={styles.name}>{t(`Point & Figure`)}</div>
                <div className={cn('icon', styles.check, {[styles.active]: chartType === 'point-figure'})} />
              </div>
            </PopupMenuItem>
            <PopupMenuItem onClick={() => updateChartSettings({type: 'renko'})}>
              <div className={styles.item}>
                <div className={styles.name}>{t(`Renko`)}</div>
                <div className={cn('icon', styles.check, {[styles.active]: chartType === 'renko'})} />
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
