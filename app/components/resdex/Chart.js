import moment from 'moment'
import { Decimal } from 'decimal.js'
import React, { Component } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from 'recharts'

import styles from './Chart.scss'

type Props = {
  language: string,
  resolution: string,
  currencyHistory: Object,
  currencies: Object
}

/**
 * @class Chart
 * @extends {Component<Props>}
 */
class Chart extends Component<Props> {
	props: Props

  getChartData() {
    const symbolsHistory = this.props.currencyHistory[this.props.resolution]

    if (!symbolsHistory) {
      return []
    }

    const currencyHistoryFirstValue = Object.values(symbolsHistory).find(value => value && value.length)

		if (!currencyHistoryFirstValue) {
			return []
		}

		const result = currencyHistoryFirstValue.map((currency, index) => {
      let indexBalance = Decimal('0')

      Object.keys(symbolsHistory).forEach(symbol => {
        const symbolHistory = symbolsHistory[symbol]

        if (!symbolHistory || symbolHistory.length <= index) {
          return
        }

        const price = symbolHistory[index].value

        if (symbol in this.props.currencies) {
          indexBalance = indexBalance.plus(this.props.currencies[symbol].balance.times(price))
        }
      })

			return {
				time: currency.time,
				value: indexBalance.toNumber()
			}
		})

    return result
  }

  renderTooltip({payload}) {
    if (!payload || payload.length === 0) {
      return null
    }

    const point = payload[0].payload
    const time = moment(point.time).locale(this.props.language).format('L kk:mm')

    return (

      <div className={styles.tooltip}>
        <strong>${point.value.toFixed(2)}</strong>
        &nbsp;
        {time}
      </div>
    )
  }

	/**
	 * @returns
   *
   * @memberof ResDexAssets
	 */
  render() {

    const timeFormat = {
      hour: 'kk:mm',
      day: 'ddd kk:mm',
      week: 'MMM DD kk:mm',
      month: 'MMM DD',
      year: 'MMM YYYY'
    }[this.props.resolution]

    const tickFormatter = tick => (
      moment(tick)
        .locale(this.props.language)
        .format(timeFormat)
        .toUpperCase()
    )

    return (
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%" debounce={1}>
          <AreaChart
            data={this.getChartData()}
            margin={{left: 0, right: 0, top: 0, bottom: 0}}
          >
            <defs>
              <linearGradient id="fillGradient" x1="0" y1="1" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e4266" />
                <stop offset="100%" stopColor="#3f356e" />
              </linearGradient>
              <linearGradient id="strokeGradient" x1="0" y1="1" x2="1" y2="1">
                <stop offset="0%" stopColor="#009ed7" />
                <stop offset="100%" stopColor="#9c62e5" />
              </linearGradient>
            </defs>

            <Area type="monotone" dataKey="value" stroke="url(#strokeGradient)" fill="url(#fillGradient)" fillOpacity={1}/>

            <XAxis
              dataKey="time"
              height={1}
              axisLine={false}
              tickLine={false}
              tickFormatter={tickFormatter}
              tick={{
                fill: '#a4abc7',
                fontFamily: 'inherit',
                fontSize: '0.55rem',
                fontWeight: 100,
                dy: -35,
              }}
              scale="time"
              type="number"
              domain={['dataMin', 'dataMax']}
            />

          <Tooltip
            cursor={{ stroke: '#9168db', strokeWidth: 1 }}
            content={data => this.renderTooltip(data)}
          />

      </AreaChart>
    </ResponsiveContainer>
  </div>
    )
  }
}

export default Chart
