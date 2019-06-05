import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'

import { tsvParse } from  'd3-dsv'
import { timeParse, timeFormat  } from 'd3-time-format'
import { scaleTime } from 'd3-scale'
import { format } from 'd3-format'

import { utcDay } from 'd3-time'
import { ChartCanvas, Chart } from 'react-stockcharts'
import {
  BarSeries,
  CandlestickSeries,
  LineSeries,
  MACDSeries
} from 'react-stockcharts/lib/series'
import {
	MACDTooltip,
} from 'react-stockcharts/lib/tooltip'
import {
	MouseCoordinateX,
	MouseCoordinateY,
} from 'react-stockcharts/lib/coordinates'
import { XAxis, YAxis } from 'react-stockcharts/lib/axes'
import { fitWidth } from 'react-stockcharts/lib/helper'
import { last, timeIntervalBarWidth } from 'react-stockcharts/lib/utils'
import { ema, macd } from 'react-stockcharts/lib/indicator'

import styles from './TradingChart.scss'

type Props = {
	width: number,
	ratio: number
}

const macdAppearance = {
	stroke: {
		macd: "#FF0000",
		signal: "#00F300",
	},
	fill: {
		divergence: "#4682B4"
	},
}

const mouseEdgeAppearance = {
	textFill: '#542605',
	stroke: "#05233B",
	strokeOpacity: 1,
	strokeWidth: 3,
	arrowWidth: 5,
	fill: "#BCDEFA",
}

const ema20 = ema()
  .id(0)
  .options({ windowSize: 20 })
  .merge((d, c) => {d.ema20 = c;})
  .accessor(d => d.ema20)

function parseData(parse) {
  return d => ({
    ...d,
		date: parse(d.date),
	})
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
		getData().then(data => {
			this.setState({ data })
      return null
    }).catch(() => null)
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
	 * @memberof TradingChart
	 */
  elementRef(element) {
    this.element = element
  }

	/**
	 * @memberof TradingChart
	 * @returns {number}
	 */
  getHeight() {
    if (!this.element) {
      return 0
    }
    return Math.max(504, this.element.clientHeight-64)
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

		const macdCalculator = macd()
			.options({
				fast: 12,
				slow: 26,
				signal: 9,
			})
			.merge((d, c) => {d.macd = c})
			.accessor(d => d.macd)

		const margin = { left: 70, right: 70, top: 20, bottom: 30 }
		const gridHeight = this.getHeight() - margin.top - margin.bottom;
		const gridWidth = width - margin.left - margin.right;

		const yGrid = { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.2 }
		const xGrid = { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.2 }

		return (
      <div className={styles.container} ref={el => this.elementRef(el)}>
        <ChartCanvas
          height={this.getHeight()}
          ratio={ratio}
          width={width}
          margin={margin}
          type="hybrid"
          seriesName="RES/MONA"
          data={this.state.data}
          xAccessor={xAccessor}
          xScale={scaleTime()}
          xExtents={this.getXExtents()}>

          <Chart id={1} yExtents={d => [d.high, d.low]}>
            <YAxis
              axisAt="right"
              orient="right"
              ticks={5}
              stroke="#a367f0"
              tickStroke="#a367f0"
              {...yGrid}
              inverted
            />

            <XAxis
              axisAt="bottom"
              orient="bottom"
              ticks={6}
              showTicks={false}
              outerTickSize={0}
              stroke="#a367f0"
              opacity={0.5}
              {...xGrid}
            />

            <CandlestickSeries
              stroke={d => d.close > d.open ? "#00d492" : "#e20063"}
              wickStroke={d => d.close > d.open ? "#00d492" : "#e20063"}
              fill={d => d.close > d.open ? "#00d492" : "#e20063"} width={timeIntervalBarWidth(utcDay)} />

            <LineSeries yAccessor={ema20.accessor()} stroke="#a367f0"/>
          </Chart>

          <Chart id={2} yExtents={d => d.volume}>
            <YAxis axisAt="left" orient="left" ticks={5} stroke="#a367f0" tickStroke="#a367f0" tickFormat={format(".0s")}/>
            <BarSeries fill="#1d2440" yAccessor={d => d.volume} />
          </Chart>

          <Chart id={3} height={150}
            yExtents={macdCalculator.accessor()}
            origin={(w, h) => [0, h - 150]} padding={{ top: 10, bottom: 10 }}
          >
            <XAxis axisAt="bottom" orient="bottom"/>
            <YAxis axisAt="right" orient="right" ticks={2} />

            <MouseCoordinateX
              at="bottom"
              orient="bottom"
              displayFormat={timeFormat("%Y-%m-%d")}
              rectRadius={5}
              {...mouseEdgeAppearance}
            />
            <MouseCoordinateY
              at="right"
              orient="right"
              displayFormat={format(".2f")}
              {...mouseEdgeAppearance}
            />

            <MACDSeries yAccessor={d => d.macd}
              {...macdAppearance} />

            <MACDTooltip
              origin={[-38, 15]}
              yAccessor={d => d.macd}
              options={macdCalculator.options()}
              appearance={macdAppearance}
            />
          </Chart>
        </ChartCanvas>
      </div>
		)
  }
}

export default connect(null, null)(translate('resdex')(fitWidth(TradingChart)))
