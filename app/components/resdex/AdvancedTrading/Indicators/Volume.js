import { format } from 'd3-format'
import React from 'react'
import { Chart } from 'react-stockcharts'
import { YAxis } from 'react-stockcharts/lib/axes'
import { AreaSeries, BarSeries } from 'react-stockcharts/lib/series'
import { CurrentCoordinate } from 'react-stockcharts/lib/coordinates'

import { RESDEX } from '~/constants/resdex'

function getVolumeIndicator(options) {
  const {
    id,
    origin,
    config: volume,
    calculator: smaVolume
  } = options

  return (
    <Chart
      id={id}
      yExtents={[d => d.volume, smaVolume.accessor()]}
      height={150}
      origin={origin}
    >
      <YAxis
        axisAt="left"
        orient="left"
        ticks={5}
        stroke="rgb(90, 98, 131)"
        tickStroke="#009ed8"
        tickFormat={format(".0s")}
        fontFamily={RESDEX.chartFontFamily}
        fontSize={10}
      />

      <BarSeries fill={
        d => d.close > d.open
          ? volume.volumeUp
          : volume.volumeDown
      } yAccessor={d => d.volume} />

      {volume.isSmaEnabled &&
        <React.Fragment>
          <AreaSeries
            yAccessor={smaVolume.accessor()}
            stroke={volume.smaStroke}
            fill={volume.smaFill}
          />
          <CurrentCoordinate
            yAccessor={smaVolume.accessor()}
            fill={volume.smaStroke}
          />
        </React.Fragment>
      }

      <CurrentCoordinate yAccessor={d => d.volume} fill="#009ed7" />

    </Chart>
  )
}

export default getVolumeIndicator
