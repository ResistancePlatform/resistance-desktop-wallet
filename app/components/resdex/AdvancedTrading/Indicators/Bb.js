import React from 'react'
import { BollingerSeries } from 'react-stockcharts/lib/series'
import { BollingerBandTooltip } from 'react-stockcharts/lib/tooltip'

import { RESDEX } from '~/constants/resdex'

function getBbIndicator(options) {
  const {
    config,
    calculator,
  } = options

  return (
    <React.Fragment>
      <BollingerSeries
        yAccessor={d => d.bb}
        stroke={{
          top: config.top,
          middle: config.middle,
          bottom: config.bottom,
        }}
        fill="#3f356e"
      />

      <BollingerBandTooltip
        origin={[-38, 60]}
        yAccessor={d => d.bb}
        options={calculator.options()}
        textFill="rgb(238, 238, 241)"
        fontFamily={RESDEX.chartFontFamily}
      />
    </React.Fragment>
  )
}

export default getBbIndicator
