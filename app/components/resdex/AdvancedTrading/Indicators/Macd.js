import { format } from 'd3-format'
import { timeFormat } from 'd3-time-format'

import React from 'react'
import { Chart } from 'react-stockcharts'
import { YAxis } from 'react-stockcharts/lib/axes'
import { MACDSeries } from 'react-stockcharts/lib/series'
import { MouseCoordinateX, MouseCoordinateY } from 'react-stockcharts/lib/coordinates'
import { MACDTooltip } from 'react-stockcharts/lib/tooltip'

import { RESDEX } from '~/constants/resdex'

function getAppearance(config) {
  const appearance = {
    stroke: {
      macd: config.main,
      signal: config.signal,
    },
    fill: {
      divergence: config.histogram
    },
  }
  return appearance
}

function getMacdIndicator(options) {
  const {
    id,
    origin,
    config,
    calculator,
    mouseEdgeAppearance,
    xAxis
  } = options

  const appearance = getAppearance(config)

  return (
   <Chart
      id={id}
      height={100}
      yExtents={calculator.accessor()}
      origin={origin}
      padding={{ top: 10, bottom: 10 }}
    >

      {xAxis}

      <YAxis
        axisAt="right"
        orient="right"
        ticks={2}
        stroke="rgb(90, 98, 131)"
        tickStroke="#009ed8"
        fontFamily={RESDEX.chartFontFamily}
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
        {...appearance}
        zeroLineStroke="#009ed8"
      />

      <MACDTooltip
        origin={[-38, 20]}
        yAccessor={d => d.macd}
        options={calculator.options()}
        appearance={appearance}
        textFill="rgb(238, 238, 241)"
        fontFamily={RESDEX.chartFontFamily}
      />
    </Chart>
  )
}

export default getMacdIndicator

