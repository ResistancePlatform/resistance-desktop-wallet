// @flow
import moment from 'moment'
import React, { Component } from 'react'
import cn from 'classnames'
import { translate } from 'react-i18next'
import {
  XYPlot,
  XAxis,
  GradientDefs,
  linearGradient,
  LineSeries,
  AreaSeries
} from 'react-vis'

import styles from './Assets.scss'

type Props = {
  t: any
}


/**
 * @class ResDexAssets
 * @extends {Component<Props>}
 */
class ResDexAssets extends Component<Props> {
	props: Props

	/**
	 * @returns
   *
   * @memberof ResDexAssets
	 */
	render() {
    const { t } = this.props

    const plotData = [
      {x: moment().add(-1, 'months'), y: 12},
      {x: moment().add(-2, 'months'), y: 15},
      {x: moment().add(-3, 'months'), y: 7},
      {x: moment().add(-4, 'months'), y: 9}
    ]

		return (
      <div className={cn(styles.container)}>

        <div className={styles.top}>
          <div className={styles.summary}>
            <div>
              {t(`Total portfolio value`)}
              <span><sup>$</sup>240<sub>.12</sub></span>
            </div>
            <div>
              {t(`Since last hour`)}
              <span><i>+</i>12,56<sub>%</sub></span>
            </div>
          </div>

          <ul className={styles.period}>
            <li>{t(`1H`)}</li>
            <li>{t(`24H`)}</li>
            <li>{t(`1W`)}</li>
            <li className={styles.active}>{t(`1M`)}</li>
            <li>{t(`1Y`)}</li>
          </ul>
        </div>

        <XYPlot
          className={styles.chart}
          xType="time"
          width={796}
          height={159}
          margin={{left: 0, right: 0, top: 0, bottom: 40}}
        >

          <GradientDefs>
            <linearGradient id="fillGradient" x1="0" y1="1" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e4266" />
              <stop offset="100%" stopColor="#3f356e" />
            </linearGradient>
            <linearGradient id="outlineGradient" x1="0" y1="1" x2="1" y2="1">
              <stop offset="0%" stopColor="#009ed7" />
              <stop offset="100%" stopColor="#9c62e5" />
            </linearGradient>
          </GradientDefs>

          <AreaSeries
            color="url(#fillGradient)"
            data={plotData}
          />

          {/* Outline */}
          <LineSeries
            strokeWidth={1}
            color="url(#outlineGradient)"
            data={plotData}
          />

          <XAxis
            left={20}
            top={80}
            style={{
              line: {stroke: 'transparent'},
              text: {
                fill: '#a4abc7',
                fontFamily: 'inherit',
                fontSize: '0.6rem',
                textTransform: 'uppercase'
              }
            }}
            hideLine
          />
        </XYPlot>

        <div className={styles.coins}>
          <div className={styles.coin}>
            <img src="assets/images/resdex/BTC.svg" alt="Bitcoin"/>

            Bitcoin
            <div className={styles.amount}>0.0097521 BTC</div>

            <div className={styles.equity}>
              <sub>$</sub>279.21
            </div>

            <div className={styles.buttons}>
              <button type="button">{t(`Withdraw`)}</button>
              <button type="button">{t(`Deposit`)}</button>
            </div>
          </div>

          <div className={styles.coin}>
            <img src="assets/images/resdex/LTC.svg" alt="Litecoin"/>

            Litecoin
            <div className={styles.amount}>1.3758594 LTC</div>

            <div className={styles.equity}>
              <sub>$</sub>75.40
            </div>

            <div className={styles.buttons}>
              <button type="button">{t(`Withdraw`)}</button>
              <button type="button">{t(`Deposit`)}</button>
            </div>
          </div>

          <div className={styles.coin}>
            <img src="assets/images/resdex/ETH.svg" alt="Ethereum"/>

            Ethereum
            <div className={styles.amount}>0.983243245 ETH</div>

            <div className={styles.equity}>
              <sub>$</sub>186.21
            </div>

            <div className={styles.buttons}>
              <button type="button">{t(`Withdraw`)}</button>
              <button type="button">{t(`Deposit`)}</button>
            </div>
          </div>
        </div>

      </div>
    )
  }
}

export default translate('resdex')(ResDexAssets)
