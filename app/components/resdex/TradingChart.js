import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import log from 'electron-log'

import { tsvParse } from  'd3-dsv'
import { timeParse } from 'd3-time-format'
import { scaleTime } from 'd3-scale'

import { utcDay } from 'd3-time'
import { ChartCanvas, Chart } from 'react-stockcharts'
import { CandlestickSeries } from 'react-stockcharts/lib/series'
import { XAxis, YAxis } from 'react-stockcharts/lib/axes'
import { fitWidth } from 'react-stockcharts/lib/helper'
import { last, timeIntervalBarWidth } from 'react-stockcharts/lib/utils'

import { ResDexState } from '~/reducers/resdex/resdex.reducer'

import styles from './TradingChart.scss'

type Props = {
  buySell: ResDexState.buySell,
	width: number,
	ratio: number
}

function parseData(parse) {
  return d => {
		d.date = parse(d.date)
		d.open = +d.open
		d.high = +d.high
		d.low = +d.low
		d.close = +d.close
		d.volume = +d.volume

		return d
	}
}

const parseDate = timeParse("%Y-%m-%d")

export function getData() {
	const promiseMSFT = fetch("https://cdn.rawgit.com/rrag/react-stockcharts/master/docs/data/MSFT.tsv")
		.then(response => response.text())
		.then(data => tsvParse(data, parseData(parseDate)))
	return promiseMSFT
}

/**
 * @class TradingChart
 * @extends {Component<Props>}
 */
class TradingChart extends Component<Props> {
	props: Props

	componentDidMount() {
    log.debug('Getting chart data')
		getData().then(data => {
      log.debug('Data', data)
			this.setState({ data })
		})
	}

	/**
	 * @returns
   * @memberof TradingChart
	 */
  getXExtents() {
    // const { trades } = this.props.buySell
    const { data } = this.state

    if (data.length < 100) {
      return []
    }

    const xExtents = [
      last(data).date,
      data[data.length - 100].date
    ]

    return xExtents
  }

	/**
	 * @returns
   * @memberof TradingChart
	 */
	render() {
    const { width, ratio } = this.props
    // const { trades } = this.props.buySell

    if (!this.state) {
      return null
    }

    const xAccessor = d => d.date

		return (
      <div className={styles.container}>
        <ChartCanvas height={400}
            ratio={ratio}
            width={width}
            margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
            type="hybrid"
            seriesName="RES/MONA"
            data={this.state.data}
            xAccessor={xAccessor}
            xScale={scaleTime()}
            xExtents={this.getXExtents()}>

          <Chart id={1} yExtents={d => [d.high, d.low]}>
            <XAxis axisAt="bottom" orient="bottom" ticks={6}/>
            <YAxis axisAt="left" orient="left" ticks={5} />
            <CandlestickSeries width={timeIntervalBarWidth(utcDay)}/>
          </Chart>
        </ChartCanvas>
      </div>
		)
  }
}

const mapStateToProps = (state) => ({
	buySell: state.resDex.buySell,
})

export default connect(mapStateToProps, null)(translate('resdex')(fitWidth(TradingChart)))
