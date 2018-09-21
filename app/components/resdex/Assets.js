// @flow
import moment from 'moment'
import React, { Component } from 'react'
import cn from 'classnames'
import { translate } from 'react-i18next'
import {
  XYPlot,
  XAxis,
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

		return (
      <div className={cn(styles.container)}>
        {t(`Total portfolio value`)}
        {t(`Since last hour`)}

        <ul className={styles.period}>
          <li>{t(`1H`)}</li>
          <li>{t(`24H`)}</li>
          <li>{t(`1W`)}</li>
          <li className={styles.active}>{t(`1M`)}</li>
          <li>{t(`1Y`)}</li>
        </ul>

        <XYPlot xType="time" width={600} height={200}>
          <XAxis />
          <AreaSeries
            data={[
              {x: moment().add(-1, 'months'), y: 3},
              {x: moment().add(-2, 'months'), y: 5},
              {x: moment().add(-3, 'months'), y: 15},
              {x: moment().add(-4, 'months'), y: 12}
            ]}
          />
        </XYPlot>

        <div className={styles.coins}>
          <div className={styles.coin}>
            Bitcoin
            0.0097521 BTC
            $279.21
            Withdraw
            Deposit
          </div>
        </div>

      </div>
    )
  }
}

export default translate('resdex')(ResDexAssets)
