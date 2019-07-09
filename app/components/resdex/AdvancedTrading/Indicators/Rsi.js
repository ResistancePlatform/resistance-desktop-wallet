import { format } from 'd3-format'

import React from 'react'
import { Chart } from 'react-stockcharts'
import { YAxis } from 'react-stockcharts/lib/axes'
import { RSISeries } from 'react-stockcharts/lib/series'
import { MouseCoordinateY } from 'react-stockcharts/lib/coordinates'
import { RSITooltip } from 'react-stockcharts/lib/tooltip'

import { RESDEX } from '~/constants/resdex'

function getRsiIndicator(options) {
  const {
    id,
    origin,
    config,
    calculator,
    mouseEdgeAppearance,
    xAxis
  } = options

  return (
    <Chart
      id={id}
      yExtents={[0, 100]}
      height={100}
      origin={origin}
      padding={{ top: 10, bottom: 10 }}
    >
      {xAxis}

      <YAxis
        axisAt="right"
        orient="right"
        tickValues={[30, 50, 70]}
        stroke="rgb(90, 98, 131)"
        tickStroke="#009ed8"
        fontFamily={RESDEX.chartFontFamily}
        fontSize={10}
      />

      <MouseCoordinateY
        at="right"
        orient="right"
        displayFormat={format(".2f")}
        {...mouseEdgeAppearance}
      />

      <RSISeries
        yAccessor={d => d.rsi}
        stroke={config.stroke}
      />

      <RSITooltip
        origin={[-38, 20]}
        yAccessor={d => d.rsi}
        options={calculator.options()}
        textFill="rgb(238, 238, 241)"
        fontFamily={RESDEX.chartFontFamily}
      />
    </Chart>
  )
}

export default getRsiIndicator
