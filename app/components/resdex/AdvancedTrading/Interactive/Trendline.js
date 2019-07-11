import React from 'react'
import { TrendLine } from 'react-stockcharts/lib/interactive'

const type = 'Trendline'

const appearance = {
  stroke: '#e20063',
  strokeOpacity: 1,
  strokeWidth: 1,
  strokeDasharray: 'Solid',
  edgeStrokeWidth: 1,
  edgeFill: '#FFFFFF',
  edgeStroke: '#e20063',
}

function getTrendlines(options) {
  const {
    chartId,
    ref,
    mode,
    config,
    update,
  } = options

  const key = `${type}_${chartId}`
  const trends = config[key] || []

  if (!(mode === 'trendline' || trends.length)) {
    return null
  }

  return (
    <TrendLine
      ref={el => ref(type, chartId, el)}
      enabled={mode === 'trendline'}
      type="RAY"
      appearance={appearance}
      snap={false}
      snapTo={d => [d.high, d.low]}
      onStart={() => false}
      onComplete={value => update({ [key]: value })}
      trends={trends}
    />
  )
}

export default getTrendlines
