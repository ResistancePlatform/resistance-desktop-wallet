import React from 'react'
import { EquidistantChannel } from 'react-stockcharts/lib/interactive'

const type = 'EquidistantChannel'

const appearance = {
		stroke: '#000000',
		strokeOpacity: 1,
		strokeWidth: 1,
		fill: '#009ed8',
		fillOpacity: 0.7,
		edgeStroke: '#000000',
		edgeFill: '#ffffff',
		edgeFill2: '#009ed8',
		edgeStrokeWidth: 1,
		r: 5,
}

function getEquidistantChannels(options) {
  const {
    chartId,
    ref,
    mode,
    config,
    update,
  } = options

  const key = `${type}_${chartId}`
  const channels = config[key] || []

  if (!(mode === 'equidistant' || channels.length)) {
    return null
  }

  return (
    <EquidistantChannel
      ref={el => ref(type, chartId, el)}
      enabled={mode === 'equidistant'}
      appearance={appearance}
      onComplete={value => update({ [key]: value })}
      channels={channels}
    />
  )
}

export default getEquidistantChannels
