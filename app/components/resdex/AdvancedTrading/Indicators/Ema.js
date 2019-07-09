import React from 'react'
import { LineSeries } from 'react-stockcharts/lib/series'
import { MovingAverageTooltip } from 'react-stockcharts/lib/tooltip'
import { CurrentCoordinate } from 'react-stockcharts/lib/coordinates'

import { RESDEX } from '~/constants/resdex'

function getEmaIndicators(options) {
  const {
    config,
    calculators,
  } = options

  const getEma = (x, calc, period, stroke) => (
    <React.Fragment>
      <LineSeries yAccessor={calc.accessor()} stroke={stroke}/>
      <MovingAverageTooltip
        onClick={e => console.log(e)}
        origin={[x, 15]}
        options={[
          {
            yAccessor: calc.accessor(),
            type: 'EMA',
            stroke,
            windowSize: period,
          },
        ]}
        textFill="rgb(238, 238, 241)"
        fontFamily={RESDEX.chartFontFamily}
      />

      <CurrentCoordinate yAccessor={calc.accessor()} fill={stroke} />
    </React.Fragment>
  )

  return (
    <React.Fragment>
      {config.isEma1Enabled &&
        getEma(-38, calculators.ema1, config.ema1Period, config.ema1)
      }
      {config.isEma2Enabled &&
        getEma(57, calculators.ema2, config.ema2Period, config.ema2)
      }
      {config.isEma3Enabled &&
        getEma(152, calculators.ema3, config.ema3Period, config.ema3)
      }
    </React.Fragment>
  )
}

export default getEmaIndicators
