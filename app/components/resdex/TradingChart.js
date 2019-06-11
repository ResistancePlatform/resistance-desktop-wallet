import React, { Component } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import log from 'electron-log'

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
	OHLCTooltip,
	MovingAverageTooltip,
	MACDTooltip,
} from 'react-stockcharts/lib/tooltip'
import {
	CrossHairCursor,
	EdgeIndicator,
	CurrentCoordinate,
	MouseCoordinateX,
	MouseCoordinateY,
} from 'react-stockcharts/lib/coordinates'
import { discontinuousTimeScaleProvider } from 'react-stockcharts/lib/scale'
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
  .options({
    windowSize: 20,
    sourcePath: 'close',
  })
  .skipUndefined(true)
  // .merge((d, c) => ({...d, ema20: c}))
  .merge((d, c) => {d.ema20 = c})
  .accessor(d => d.ema20)
  .stroke('red')

const macdCalculator = macd()
  .options({
    fast: 12,
    slow: 26,
    signal: 9,
  })
  .merge((d, c) => {d.macd = c})
  .accessor(d => d.macd)

function parseData(parse) {
  return d => ({
    ...d,
		date: parse(d.date),
		open: +d.open,
		high: +d.high,
		low: +d.low,
		close: +d.close,
		volume: +d.volume,
	})
}

const parseDate = timeParse("%Y-%m-%d")

function getData() {
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
    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.date)

    log.debug("Calculatin things")

		getData().then(initialData => {
      const calculatedData = ema20(macdCalculator(initialData))

      const {
        data,
        xScale,
        xAccessor,
        displayXAccessor,
      } = xScaleProvider(calculatedData)

      log.debug(xScale, xAccessor, displayXAccessor, data.length)
      log.debug(data)

      this.setState({
        data,
        xScale,
        xAccessor,
        displayXAccessor,
      })

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

    if (!data.length) {
      return []
    }

    const xExtents = [
      last(data).date,
      data[Math.max(data.length - 100, 0)].date
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

    if (!this.state || !this.state.data) {
      return null
    }

		const margin = { left: 70, right: 70, top: 20, bottom: 30 }
		const gridHeight = this.getHeight() - margin.top - margin.bottom;
		const gridWidth = width - margin.left - margin.right;

		const yGrid = { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.2 }
		const xGrid = { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.2 }

    const height = this.getHeight()

		return (
      <div className={styles.container} ref={el => this.elementRef(el)}>
        <ChartCanvas
          height={height}
          ratio={ratio}
          width={width}
          margin={margin}
          type="hybrid"
          seriesName="RES/MONA"
          data={this.state.data}
          xAccessor={d => d.date}
          xScale={scaleTime()}
          xExtents={this.getXExtents()}>

          <Chart id={1} height={height-150}
            yExtents={[d => [d.high, d.low], ema20.accessor()]}
            padding={{ top: 10, bottom: 20 }}
          >
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

            <MouseCoordinateY
              at="right"
              orient="right"
              displayFormat={format(".2f")}
              {...mouseEdgeAppearance}
            />

            <LineSeries yAccessor={ema20.accessor()} stroke={ema20.stroke()}/>

            <CandlestickSeries
              stroke={d => d.close > d.open ? "#00d492" : "#e20063"}
              wickStroke={d => d.close > d.open ? "#00d492" : "#e20063"}
              fill={d => d.close > d.open ? "#00d492" : "#e20063"} width={timeIntervalBarWidth(utcDay)} />

            <EdgeIndicator itemType="last" orient="right" edgeAt="right"
              yAccessor={d => d.close}
              fill={d => d.close > d.open ? "#A2F5BF" : "#F9ACAA"}
              stroke={d => d.close > d.open ? "#0B4228" : "#6A1B19"}
              textFill={d => d.close > d.open ? "#0B4228" : "#420806"}
              strokeOpacity={1}
              strokeWidth={3}
              arrowWidth={2}
            />

            <OHLCTooltip origin={[-40, 0]}/>

            <CurrentCoordinate yAccessor={ema20.accessor()} fill={ema20.stroke()} />

            <MovingAverageTooltip
              onClick={e => console.log(e)}
              origin={[-38, 15]}
              options={[
                {
                  yAccessor: ema20.accessor(),
                  type: "EMA",
                  stroke: ema20.stroke(),
                  windowSize: ema20.options().windowSize,
                },
              ]}
            />
          </Chart>

          <Chart
            id={2}
            yExtents={d => d.volume}
            origin={(w, h) => [0, h - 300]}
          >
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

          <CrossHairCursor />

        </ChartCanvas>
      </div>
		)
  }
}

const mapStateToProps = (state) => ({
       resDex: state.resDex,
})

export default connect(mapStateToProps, null)(translate('resdex')(fitWidth(TradingChart)))
