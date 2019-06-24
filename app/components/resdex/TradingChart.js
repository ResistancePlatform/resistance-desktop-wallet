import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'

import { timeFormat } from 'd3-time-format'
import { scaleTime } from 'd3-scale'
import { format } from 'd3-format'
import { utcHour, utcDay, utcWeek, utcMonth, utcYear } from 'd3-time'
import { ChartCanvas, Chart } from 'react-stockcharts'
import {
  AreaSeries,
  BarSeries,
  CandlestickSeries,
  BollingerSeries,
  LineSeries,
  MACDSeries,
  RSISeries,
} from 'react-stockcharts/lib/series'
import {
	OHLCTooltip,
	MovingAverageTooltip,
  BollingerBandTooltip,
	MACDTooltip,
  RSITooltip,
} from 'react-stockcharts/lib/tooltip'
import {
	CrossHairCursor,
	EdgeIndicator,
	CurrentCoordinate,
	MouseCoordinateX,
	MouseCoordinateY,
} from 'react-stockcharts/lib/coordinates'
import { XAxis, YAxis } from 'react-stockcharts/lib/axes'
import { fitWidth } from 'react-stockcharts/lib/helper'
import { first, last, timeIntervalBarWidth } from 'react-stockcharts/lib/utils'
import { sma, ema, bollingerBand, rsi, macd } from 'react-stockcharts/lib/indicator'

import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'
import TradingChartSettings from './TradingChartSettings'

import styles from './TradingChart.scss'

type Props = {
  t: any,
  actions: object,
  resDex: any,
	width: number,
	ratio: number
}

const chartFontFamily = `Quicksand, Arial, Helvetica, Helvetica Neue, serif`

const macdAppearance = {
	stroke: {
		macd: "#e20063",
		signal: "#00d492",
	},
	fill: {
		divergence: "#009ed8"
	},
}

const mouseEdgeAppearance = {
	textFill: '#a4abc7',
	strokeOpacity: 1,
	strokeWidth: 0,
	arrowWidth: 5,
	fill: "#262c47",
}

const ema20 = ema()
  .options({
    windowSize: 20,
    sourcePath: 'close',
  })
  .skipUndefined(true)
  .merge((d, c) => ({...d, ema20: c}))
  .accessor(d => d.ema20)
  .stroke('#00d492')

const ema50 = ema()
  .options({
    windowSize: 50,
    sourcePath: 'close',
  })
  .skipUndefined(true)
  .merge((d, c) => ({...d, ema50: c}))
  .accessor(d => d.ema50)
  .stroke('#e20063')

const smaVolume50 = sma()
  .options({ windowSize: 20, sourcePath: 'volume' })
  .merge((d, c) => ({...d, smaVolume50: c}))
  .accessor(d => d.smaVolume50)
  .stroke('#009ed7')
  .fill('#1e4266')

const bb = bollingerBand()
  .merge((d, c) => ({...d, bb: c}))
  .accessor(d => d.bb)

const macdCalculator = macd()
  .options({
    fast: 12,
    slow: 26,
    signal: 9,
  })
  .merge((d, c) => ({...d, macd: c}))
  .accessor(d => d.macd)

const rsiCalculator = rsi()
  .options({ windowSize: 14 })
  .merge((d, c) => ({...d, rsi: c}))
  .accessor(d => d.rsi);

/**
 * @class TradingChart
 * @extends {Component<Props>}
 */
class TradingChart extends Component<Props> {
	props: Props

	getData() {
    const { ohlc } = this.props.resDex.buySell

    const initialData = ohlc.filter(tick => tick.open > 0)

    const calculatedData = rsiCalculator(
      bb(
        smaVolume50(
          ema20(
            ema50(
              macdCalculator(initialData)
            )
          )
        )
      )
    )

    return calculatedData
	}

	/**
	 * @returns
   * @memberof TradingChart
	 */
  getXExtents(data, period: string) {
    const barsNumber = 100

    if (!data.length) {
      return []
    }

    const lastDate = last(data).date
    let firstDate = new Date(lastDate.getTime())

    switch (period) {
      case 'hour':
        firstDate.setHours(firstDate.getHours() - barsNumber)
        break
      case 'day':
        firstDate.setDate(firstDate.getDate() - barsNumber)
        break
      case 'week':
        firstDate.setDate(firstDate.getDate() - barsNumber * 7)
        break
      case 'month':
        firstDate.setMonth(firstDate.getMonth() - barsNumber)
        break
      case 'year':
        firstDate.setYear(firstDate.getMonth() - barsNumber)
        break
      case 'all':
        firstDate = first(data).date
        break
      default:
    }

    const firstTime = first(data).date.getTime()

    if (firstDate.getTime() < firstTime) {
      firstDate = first(data).date
    }

    return [lastDate, firstDate]
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

  getBottomIndicatorsNumber() {
    const { tradingChart } = this.props.resDex.buySell
    let counter = 0

    if (tradingChart.macd) {
      counter += 1
    }

    if (tradingChart.rsi) {
      counter += 1
    }

    return counter
  }

  getXAxis(xGrid, showTicks: boolean) {
    return (
      <XAxis
        axisAt="bottom"
        orient="bottom"
        stroke="#009ed8"
        tickStroke="#009ed8"
        showTicks={showTicks}
        fontFamily={chartFontFamily}
        fontSize="8"
        outerTickSize={0}
        opacity={0.5}
        {...xGrid}
      />
    )
  }

	/**
	 * @returns
   * @memberof TradingChart
	 */
	render() {
    const { width, ratio } = this.props

		const margin = { left: 50, right: 50, top: 20, bottom: 30 }
		const gridHeight = this.getHeight() - margin.top - margin.bottom;
		const gridWidth = width - margin.left - margin.right;

		const yGrid = { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.2 }
		const xGrid = { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.2 }

    const height = this.getHeight()

    const { period: chartPeriod } = this.props.resDex.buySell.tradingChart
    const d3Interval = {
      'hour': utcHour,
      'day': utcDay,
      'week': utcWeek,
      'month': utcMonth,
      'year': utcYear,
      'all': utcYear,
    }[chartPeriod] || utcDay

    const { tradingChart: chartSettings } = this.props.resDex.buySell

    const bottomIndicatorHeight = 100
    const bottomIndicatorsNumber = this.getBottomIndicatorsNumber()

    const data = this.getData()

    if (!data.length) {
      return null
    }

		return (
      <div className={styles.container} ref={el => this.elementRef(el)}>
        <TradingChartSettings />

        <ChartCanvas
          height={height}
          ratio={ratio}
          width={width}
          margin={margin}
          type="hybrid"
          seriesName="RES/MONA"
          data={data}
          xAccessor={d => d.date}
          xScale={scaleTime().domain([new Date(2000, 0, 1, 0), new Date(2000, 0, 1, 1)])}
          xExtents={this.getXExtents(data, chartPeriod)}>

          <Chart id={1} height={height - bottomIndicatorsNumber * bottomIndicatorHeight - 50}
            yExtents={[d => [d.high, d.low], ema20.accessor()]}
            padding={{ top: 10, bottom: 20 }}
          >
            <YAxis
              axisAt="right"
              orient="right"
              ticks={5}
              stroke="rgb(90, 98, 131)"
              tickStroke="#009ed8"
              fontFamily={chartFontFamily}
              fontSize={10}
              {...yGrid}
              inverted
            />

            { this.getXAxis(xGrid, bottomIndicatorsNumber === 0) }

            <MouseCoordinateY
              at="right"
              orient="right"
              displayFormat={format(".2f")}
              {...mouseEdgeAppearance}
            />

            {chartSettings.ema20 &&
              <LineSeries yAccessor={ema20.accessor()} stroke={ema20.stroke()}/>
            }

            {chartSettings.ema50 &&
              <LineSeries yAccessor={ema50.accessor()} stroke={ema50.stroke()}/>
            }

            <CandlestickSeries
              stroke={d => d.close > d.open ? "#00d492" : "#e20063"}
              wickStroke={d => d.close > d.open ? "#00d492" : "#e20063"}
              fill={d => d.close > d.open ? "#00d492" : "#e20063"}
              width={timeIntervalBarWidth(d3Interval)}
            />

            {chartSettings.bb &&
              <BollingerSeries
                yAccessor={d => d.bb}
                stroke={{
                  top: "#009ed7",
                  middle: "#9c62e5",
                  bottom: "#009ed7",
                }}
                fill="#3f356e"
              />
            }

            <EdgeIndicator
              itemType="last"
              orient="right"
              edgeAt="right"
              yAccessor={d => d.close}
              fill={d => d.close > d.open ? "#00d492" : "#e20063"}
              textFill="rgb(90, 98, 131)"
              strokeOpacity={1}
              strokeWidth={0}
              arrowWidth={2}
            />

            <OHLCTooltip
              origin={[-40, 0]}
              textFill="rgb(238, 238, 241)"
              fontFamily={chartFontFamily}
            />

            <CurrentCoordinate yAccessor={ema20.accessor()} fill={ema20.stroke()} />

            {chartSettings.ema20 &&
              <MovingAverageTooltip
                onClick={e => console.log(e)}
                origin={[-38, 15]}
                options={[
                  {
                    yAccessor: ema20.accessor(),
                    type: 'EMA',
                    stroke: ema20.stroke(),
                    windowSize: ema20.options().windowSize,
                  },
                ]}
                textFill="rgb(238, 238, 241)"
                fontFamily={chartFontFamily}
              />
            }

            {chartSettings.ema50 &&
              <MovingAverageTooltip
                onClick={e => console.log(e)}
                origin={[chartSettings.ema20 ? 57 : -38, 15]}
                options={[
                  {
                    yAccessor: ema50.accessor(),
                    type: 'EMA',
                    stroke: ema50.stroke(),
                    windowSize: ema50.options().windowSize,
                  },
                ]}
                textFill="rgb(238, 238, 241)"
                fontFamily={chartFontFamily}
              />
            }

            {chartSettings.bb &&
              <BollingerBandTooltip
                origin={[-38, 60]}
                yAccessor={d => d.bb}
                options={bb.options()}
                textFill="rgb(238, 238, 241)"
                fontFamily={chartFontFamily}
              />
            }

          </Chart>

          {chartSettings.volume &&
           <Chart
              id={2}
              yExtents={[d => d.volume, smaVolume50.accessor()]}
              height={150}
              origin={(w, h) => [0, h - bottomIndicatorsNumber * bottomIndicatorHeight - 150]}
            >
              <YAxis
                axisAt="left"
                orient="left"
                ticks={5}
                stroke="rgb(90, 98, 131)"
                tickStroke="#009ed8"
                tickFormat={format(".0s")}
                fontFamily={chartFontFamily}
                fontSize={10}
              />

              <BarSeries fill="#1d2440" yAccessor={d => d.volume} />
              <AreaSeries yAccessor={smaVolume50.accessor()} stroke={smaVolume50.stroke()} fill={smaVolume50.fill()}/>

              <CurrentCoordinate yAccessor={smaVolume50.accessor()} fill={smaVolume50.stroke()} />
              <CurrentCoordinate yAccessor={d => d.volume} fill="#009ed7" />
            </Chart>
          }

          {chartSettings.macd &&
            <Chart
              id={3}
              height={bottomIndicatorHeight}
              yExtents={macdCalculator.accessor()}
              origin={(w, h) => [0, h - bottomIndicatorsNumber * bottomIndicatorHeight]}
              padding={{ top: 10, bottom: 10 }}
            >

              { this.getXAxis(xGrid, bottomIndicatorsNumber === 1) }

              <YAxis
                axisAt="right"
                orient="right"
                ticks={2}
                stroke="rgb(90, 98, 131)"
                tickStroke="#009ed8"
                fontFamily={chartFontFamily}
                fontSize={10}
              />

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

              <MACDSeries
                yAccessor={d => d.macd}
                {...macdAppearance}
              />

              <MACDTooltip
                origin={[-38, 20]}
                yAccessor={d => d.macd}
                options={macdCalculator.options()}
                appearance={macdAppearance}
                textFill="rgb(238, 238, 241)"
                fontFamily={chartFontFamily}
              />
            </Chart>
          }

          {chartSettings.rsi &&
           <Chart id={4}
              yExtents={[0, bottomIndicatorHeight]}
              height={bottomIndicatorHeight}
              origin={(w, h) => [0, h - bottomIndicatorHeight]}
              padding={{ top: 10, bottom: 10 }}
            >
              { this.getXAxis(xGrid, true) }

              <YAxis
                axisAt="right"
                orient="right"
                tickValues={[30, 50, 70]}
                stroke="rgb(90, 98, 131)"
                tickStroke="#009ed8"
                fontFamily={chartFontFamily}
                fontSize={10}
              />

              <MouseCoordinateY
                at="right"
                orient="right"
                displayFormat={format(".2f")}
                {...mouseEdgeAppearance}
              />

              <RSISeries yAccessor={d => d.rsi} />

              <RSITooltip
                origin={[-38, 20]}
                yAccessor={d => d.rsi}
                options={rsiCalculator.options()}
                textFill="rgb(238, 238, 241)"
                fontFamily={chartFontFamily}
              />
            </Chart>
          }

          <CrossHairCursor />

        </ChartCanvas>
      </div>
		)
  }
}

const mapStateToProps = state => ({
  resDex: state.resDex,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexBuySellActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(fitWidth(TradingChart)))
