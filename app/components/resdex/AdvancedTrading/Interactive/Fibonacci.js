import React from 'react'
import { FibonacciRetracement } from 'react-stockcharts/lib/interactive'

import { RESDEX } from '~/constants/resdex'

const type = 'FibonacciRetracement'

const appearance = {
		stroke: '#009ed8',
		strokeWidth: 1,
		strokeOpacity: 1,
		fontFamily: RESDEX.chartFontFamily,
		fontSize: 11,
		fontFill: '#009ed8',
		edgeStroke: '#000000',
		edgeFill: '#FFFFFF',
		nsEdgeFill: '#009ed8',
		edgeStrokeWidth: 1,
		r: 5,
}

function getFibonacciRetracements(options) {
  const {
    chartId,
    ref,
    mode,
    config,
    update,
  } = options

  const key = `${type}_${chartId}`
  const retracements = config[key] || []

  if (!(mode === 'fibonacci' || retracements.length)) {
    return null
  }

  return (
    <FibonacciRetracement
      ref={el => ref(type, chartId, el)}
      enabled={mode === 'fibonacci'}
      appearance={appearance}
      onComplete={value => update({ [key]: value })}
      retracements={retracements}
    />
  )
}

export default getFibonacciRetracements
