import React from 'react'
import { StandardDeviationChannel } from 'react-stockcharts/lib/interactive'

const type = 'StandardDeviationChannel'

const appearance = {
		stroke: '#009ed8',
		fillOpacity: 0.2,
		strokeOpacity: 1,
		strokeWidth: 1,
		fill: '#009ed8',
		edgeStrokeWidth: 2,
		edgeStroke: '#009ed8',
		edgeFill: '#ffffff',
		r: 5,
}

function getStandardDeviationChannels(options) {
  const {
    chartId,
    ref,
    mode,
    config,
    update,
  } = options

  const key = `${type}_${chartId}`
  const channels = config[key] || []

  if (!(mode === 'standardDeviation' || channels.length)) {
    return null
  }

  return (
    <StandardDeviationChannel
      ref={el => ref(type, chartId, el)}
      enabled={mode === 'standardDeviation'}
      appearance={appearance}
      onComplete={value => update({ [key]: value })}
      channels={channels}
    />
  )
}

export default getStandardDeviationChannels
