import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import log from 'electron-log'

import { format } from 'd3-format'
import { scaleTime } from 'd3-scale'
import { discontinuousTimeScaleProvider } from 'react-stockcharts/lib/scale'
import { ChartCanvas, Chart } from 'react-stockcharts'
import { OHLCTooltip } from 'react-stockcharts/lib/tooltip'
import {
	CrossHairCursor,
	EdgeIndicator,
	MouseCoordinateY,
} from 'react-stockcharts/lib/coordinates'
import { XAxis, YAxis } from 'react-stockcharts/lib/axes'
import { fitWidth } from 'react-stockcharts/lib/helper'
import { first, last } from 'react-stockcharts/lib/utils'
import {
  heikinAshi,
  kagi,
  pointAndFigure,
  renko,
  sma,
  ema,
  bollingerBand,
  rsi,
  macd
} from 'react-stockcharts/lib/indicator'
import { DrawingObjectSelector } from 'react-stockcharts/lib/interactive'

import { RESDEX } from '~/constants/resdex'
import {
  getVolumeIndicator,
  getMacdIndicator,
  getBbIndicator,
  getRsiIndicator,
  getEmaIndicators,
} from './Indicators'
import {
  getTrendlines,
  getFibonacciRetracements,
  getEquidistantChannels,
  getStandardDeviationChannels,
  getGannFans,
  getInteractiveTexts,
  getAlerts,
  getOrders,
} from './Interactive'
import getMainSeries from './MainSeries'
import { ResDexBuySellActions } from '~/reducers/resdex/buy-sell/reducer'
import TradingChartSettings from './TradingChartSettings'

import styles from './TradingChart.scss'
import animatedSpinner from '~/assets/images/animated-spinner.svg'

type Props = {
  t: any,
  actions: object,
  resDex: any,
	width: number,
	ratio: number
}

const ha = heikinAshi()
const kagiCalculator = kagi()
const pAndF = pointAndFigure()
const renkoCalculator = renko()

const mouseEdgeAppearance = {
	textFill: '#a4abc7',
	strokeOpacity: 1,
	strokeWidth: 0,
	arrowWidth: 5,
	fill: "#262c47",
}

/**
 * @class TradingChart
 * @extends {Component<Props>}
 */
class TradingChart extends Component<Props> {
	props: Props

  constructor(props) {
    super(props)
    this.interactiveRef = this.interactiveRef.bind(this)
    this.onKeyPress = this.onKeyPress.bind(this)
  }

	/**
	 * @memberof TradingChart
	 */
  componentDidMount() {
		document.addEventListener('keyup', this.onKeyPress)
  }

	componentWillUnmount() {
		document.removeEventListener("keyup", this.onKeyPress)
	}

/**
 * Adds an extra data point if data size is too small.
 *
 * @class TradingChart
 * @extends {Component<Props>}
 */
  tweakData(sourceData) {
    const data = sourceData.slice()

    if (sourceData.length === 1) {
      log.debug(`Tweaking data of length`, sourceData.length)
      for (let day = -1; day > -2; day -= 1) {
        const dayDate = new Date(sourceData[0].date.getTime())
        dayDate.setDate(dayDate.getDate() + day)
        data.unshift({
          ...sourceData[0],
          date: dayDate,
        })
      }
    }

    // log.debug(`Data`, JSON.stringify(data))
    return data
  }

  getCalculators() {
    const config = this.indicatorsConfig

    const emaCalculator = period => ema()
        .options({
          windowSize: period,
          sourcePath: 'close',
        })
        .skipUndefined(true)
        .merge((d, c) => ({...d, ema20: c}))
        .accessor(d => d.ema20)

    const calculators = {}

    if (config.ema) {
      calculators.ema1 = emaCalculator(config.ema.ema1Period)
      calculators.ema2 = emaCalculator(config.ema.ema2Period)
      calculators.ema3 = emaCalculator(config.ema.ema3Period)
    }

    if (config.volume) {
      calculators.smaVolume = sma()
        .options({
          windowSize: config.volume.smaPeriod,
          sourcePath: 'volume'
        })
        .merge((d, c) => ({...d, smaVolume: c}))
        .accessor(d => d.smaVolume)
    }

    if (config.bb) {
      calculators.bb = bollingerBand()
        .options({ windowSize: config.bb.smaPeriod, multiplier: config.bb.standardDeviation })
        .merge((d, c) => ({...d, bb: c}))
        .accessor(d => d.bb)
    }

    if (config.macd) {
      calculators.macd = macd()
        .options({
          fast: config.macd.fastPeriod,
          slow: config.macd.slowPeriod,
          signal: config.macd.signalPeriod,
        })
        .merge((d, c) => ({...d, macd: c}))
        .accessor(d => d.macd)
    }

    if (config.rsi) {
      calculators.rsi = rsi()
        .options({ windowSize: config.rsi.period })
        .merge((d, c) => ({...d, rsi: c}))
        .accessor(d => d.rsi)
    }

    return calculators
  }

  calculateIndicators(data) {
    const { tradingChart } = this.props.resDex.buySell

    let calculatedData = data

    Object.keys(this.calculators).forEach(key => {
      calculatedData = this.calculators[key](calculatedData)
    })

    switch (tradingChart.type) {
      case 'heikin-ashi':
        calculatedData = ha(calculatedData)
        break
      case 'kagi':
        calculatedData = kagiCalculator(calculatedData)
        break
      case 'point-figure':
        calculatedData = pAndF(calculatedData)
        break
      case 'renko':
        calculatedData = renkoCalculator(calculatedData)
        break
      default:
    }

    return calculatedData
  }

	getDataAndScale() {
    const { ohlc: initialData } = this.props.resDex.buySell

    if (initialData.length === 0) {
      return {
        data: [],
        xScale: null,
        xAccessor: null,
        displayXAccessor: null,
      }
    }

		const xScaleProvider = discontinuousTimeScaleProvider
      .inputDateAccessor(d => d && d.date)

    const {
      data,
      xAccessor,
      displayXAccessor,
    } = xScaleProvider(this.tweakData(initialData))

    const calculatedData = this.calculateIndicators(data)

    const result = {
      data: calculatedData,
      xScale: scaleTime(),
      xAccessor,
      displayXAccessor,
    }

    // log.debug('data', calculatedData)

    return result
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
        firstDate.setMonth(firstDate.getMonth() - barsNumber * 12)
        break
      case 'all':
        firstDate = first(data).date
        break
      default:
    }

    log.debug(`XExtents`, firstDate, lastDate)

    return [firstDate, lastDate]
  }

	/**
	 * @memberof TradingChart
	 */
  containerRef(element) {
    this.containerElement = element
  }

	/**
	 * @memberof TradingChart
	 */
  chartRef(element) {
    this.chartElement = element
  }

	/**
	 * @memberof TradingChart
	 */
  interactiveRef(type, chartId, element) {
    if (!this.interactiveNodes) {
      this.interactiveNodes = {}
    }

    const key = `${type}_${chartId}`

    if (element || this.interactiveNodes.key) {
      this.interactiveNodes = {
        ...this.interactiveNodes,
        [key]: { type, chartId, node: element }
      }
    }
  }


	/**
	 * @memberof TradingChart
	 * @returns {number}
	 */
  getHeight() {
    if (!this.containerElement) {
      return 0
    }
    return Math.max(504, this.containerElement.clientHeight - 64)
  }

  getBottomIndicatorsNumber() {
    let counter = 0

    if (this.indicatorsConfig.macd) {
      counter += 1
    }

    if (this.indicatorsConfig.rsi) {
      counter += 1
    }

    return counter
  }

  getXAxis(xGrid, showTicks: boolean) {
    log.debug('xGrid', JSON.stringify(xGrid))
    return (
      <XAxis
        axisAt="bottom"
        orient="bottom"
        stroke="#009ed8"
        tickStroke="#009ed8"
        showTicks={showTicks}
        fontFamily={RESDEX.chartFontFamily}
        fontSize="8"
        outerTickSize={0}
        opacity={0.5}
        {...xGrid}
      />
    )
  }

  getIndicatorConfig(key: string) {
    const { indicators } = this.props.resDex.buySell.tradingChart
    const indicator = indicators[key]

    if (!indicator) {
      return false
    }

    let result = indicator.inputs.reduce((accumulated, input) => ({
      ...accumulated,
      [input.name]: input.value
    }), {})

    result = indicator.colors.reduce((accumulated, color) => ({
      ...accumulated,
      [color.name]: color.value
    }), result)

    return result
  }

  getIndicatorsConfig() {
    const { indicators } = this.props.resDex.buySell.tradingChart

    log.debug('indicators', Object.keys(indicators))
    const config = Object.keys(indicators).reduce((accumulated, key) => ({
      ...accumulated,
      [key]: this.getIndicatorConfig(key)
    }), {})

    return config
  }

  getGrids(margin) {
    const { width } = this.props

		const gridHeight = this.getHeight() - margin.top - margin.bottom;
		const gridWidth = width - margin.left - margin.right;

		const xGrid = { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.2 }
		const yGrid = { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.2 }

    return {
      xGrid,
      yGrid,
    }
  }

  onKeyPress(event) {
    if (!this.chartElement) {
      return
    }

    const { interactive } = this.props.resDex.buySell.tradingChart

    switch (event.which) {
      // Backspace and Delete
      case 8:
      case 46: {
        const newInteractive = Object.keys(interactive).reduce((accumulated, key) => ({
          ...accumulated,
          [key]: interactive[key].filter(item => !item.selected)
        }), {})
        log.debug('New interactive', newInteractive)
        this.props.actions.updateInteractive(newInteractive)
        break
      }
      // Escape
      case 27: {
        this.chartElement.cancelDrag()
        break
      }
      default:
    }
  }

  handleInteractiveSelection(interactives) {
    log.debug(`Interactives`, JSON.stringify(interactives))

    const config = interactives.reduce((accumulated, value) => ({
      [`${value.type}_${value.chartId}`]: value.objects
    }), {})

    this.props.actions.updateInteractive(config)
  }

	/**
	 * @returns
   * @memberof TradingChart
	 */
  getActiveOrders() {
    const { swapHistory } = this.props.resDex.orders
    const orders = swapHistory.filter(s => s.isActive && !s.isHidden)
    return orders
  }

	/**
	 * @returns
   * @memberof TradingChart
	 */
	render() {
    const { t, width, ratio } = this.props

		const margin = { left: 50, right: 50, top: 20, bottom: 30 }
    const { xGrid, yGrid } = this.getGrids(margin)

    const height = this.getHeight()

    const { tradingChart: chartSettings } = this.props.resDex.buySell
    const { interactive } = chartSettings

    const bottomIndicatorHeight = 100

    this.indicatorsConfig = this.getIndicatorsConfig()
    this.calculators = this.getCalculators()

    const bottomIndicatorsNumber = this.getBottomIndicatorsNumber()

    const {
      data,
      xScale,
      displayXAccessor,
    } = this.getDataAndScale()


    const { baseCurrency, quoteCurrency } = this.props.resDex.buySell
    const { baseCurrency: base, quoteCurrency: rel } = this.props.resDex.buySell.ohlcPair

    const isLoading = baseCurrency !== base || quoteCurrency !== rel

    const orders = this.getActiveOrders()

		return (
      <div className={styles.container} ref={el => this.containerRef(el)}>
        <TradingChartSettings />

        {isLoading &&
          <div className={styles.loading}>
            <img
              className={styles.spinner}
              src={animatedSpinner}
              alt={t(`Loading...`)}
            />
          </div>
        }

        {!isLoading && data.length > 1 &&
        <ChartCanvas
          ref={el => this.chartRef(el)}
          height={height}
          ratio={ratio}
          width={width}
          margin={margin}
          type="hybrid"
          data={data}
          xAccessor={d => d && d.date}
          xScale={xScale}
          displayXAccessor={displayXAccessor}
          xExtents={this.getXExtents(data, chartSettings.period)}>

          <Chart id={1} height={height - bottomIndicatorsNumber * bottomIndicatorHeight - 50}
            yExtents={[d => [d.high, d.low]]}
            padding={{ top: 10, bottom: 20 }}
          >
            <YAxis
              axisAt="right"
              orient="right"
              ticks={5}
              stroke="rgb(90, 98, 131)"
              tickStroke="#009ed8"
              fontFamily={RESDEX.chartFontFamily}
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

            {this.indicatorsConfig.ema && getEmaIndicators({
              config: this.indicatorsConfig.ema,
              calculators: this.calculators
            })}

            {this.indicatorsConfig.bb && getBbIndicator({
                config: this.indicatorsConfig.bb,
                calculator: this.calculators.bb
              })
            }

            {getMainSeries({
              type: chartSettings.type,
              period: chartSettings.period
            })}

            <EdgeIndicator
              itemType="last"
              orient="right"
              edgeAt="right"
              yAccessor={d => d.close}
              fill={d => d.close > d.open ? "#00d492" : "#e20063"}
              textFill="rgb(90, 98, 131)"
              displayFormat={format('.6f')}
              strokeOpacity={1}
              strokeWidth={0}
              arrowWidth={2}
            />

            <OHLCTooltip
              origin={[-40, 0]}
              textFill="rgb(238, 238, 241)"
              fontFamily={RESDEX.chartFontFamily}
            />

            {getTrendlines({
                chartId: 1,
                ref: this.interactiveRef,
                mode: chartSettings.interactiveMode,
                config: interactive,
                update: this.props.actions.updateInteractive
            })}

            {getFibonacciRetracements({
                chartId: 1,
                ref: this.interactiveRef,
                mode: chartSettings.interactiveMode,
                config: interactive,
                update: this.props.actions.updateInteractive
            })}

            {getEquidistantChannels({
                chartId: 1,
                ref: this.interactiveRef,
                mode: chartSettings.interactiveMode,
                config: interactive,
                update: this.props.actions.updateInteractive
            })}

            {getStandardDeviationChannels({
                chartId: 1,
                ref: this.interactiveRef,
                mode: chartSettings.interactiveMode,
                config: interactive,
                update: this.props.actions.updateInteractive
            })}

            {getGannFans({
                chartId: 1,
                ref: this.interactiveRef,
                mode: chartSettings.interactiveMode,
                config: interactive,
                update: this.props.actions.updateInteractive
            })}

            {getInteractiveTexts({
                chartId: 1,
                ref: this.interactiveRef,
                mode: chartSettings.interactiveMode,
                config: interactive,
                update: this.props.actions.updateInteractive
            })}

            {getAlerts({
                chartId: 1,
                ref: this.interactiveRef,
                mode: chartSettings.interactiveMode,
                config: interactive,
                update: this.props.actions.updateInteractive
            })}

            {getOrders({
                chartId: 1,
                ref: this.interactiveRef,
                orders,
                baseCurrency,
                quoteCurrency
            })}

          </Chart>

          {this.indicatorsConfig.volume && getVolumeIndicator({
              id: 2,
              config: this.indicatorsConfig.volume,
              origin: (w, h) => [0, h - bottomIndicatorsNumber * bottomIndicatorHeight - 150],
              calculator: this.calculators.smaVolume
            })
          }

          {this.indicatorsConfig.macd && getMacdIndicator({
              id: 3,
              config: this.indicatorsConfig.macd,
              origin: (w, h) => [0, h - bottomIndicatorsNumber * bottomIndicatorHeight],
              mouseEdgeAppearance,
              xAxis: this.getXAxis(xGrid, bottomIndicatorsNumber === 1),
              calculator: this.calculators.macd
            })
          }

          {this.indicatorsConfig.rsi && getRsiIndicator({
              id: 4,
              config: this.indicatorsConfig.rsi,
              xAxis: this.getXAxis(xGrid, true),
              origin: (w, h) => [0, h - bottomIndicatorHeight],
              mouseEdgeAppearance,
              calculator: this.calculators.rsi,
            })
          }

          <CrossHairCursor
            stroke="rgb(238, 238, 241)"
          />

          <DrawingObjectSelector
            enabled={chartSettings.interactiveMode === null}
            getInteractiveNodes={() => this.interactiveNodes}
            drawingObjectMap={{
              Trendline: 'trends',
              FibonacciRetracement: 'retracements',
              EquidistantChannel: 'channels',
              StandardDeviationChannel: 'channels',
              GannFan: 'fans',
							InteractiveText: 'textList',
              InteractiveYCoordinate: 'yCoordinateList',
            }}
            onSelect={interactives => this.handleInteractiveSelection(interactives)}
          />

        </ChartCanvas>
        }
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
