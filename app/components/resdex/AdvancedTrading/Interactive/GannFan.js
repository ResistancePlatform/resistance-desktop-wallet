import React from 'react'
import { GannFan } from 'react-stockcharts/lib/interactive'

import { RESDEX } from '~/constants/resdex'

const type = 'GannFan'

const appearance = {
    stroke: '#009ed8',
		fillOpacity: 0.2,
		strokeOpacity: 1,
		strokeWidth: 1,
		edgeStroke: '#009ed8',
		edgeFill: '#ffffff',
		edgeStrokeWidth: 1,
		r: 5,
		fill: [
			'#e41a1c',
			'#377eb8',
			'#4daf4a',
			'#984ea3',
			'#ff7f00',
			'#ffff33',
			'#a65628',
			'#f781bf',
		],
		fontFamily: RESDEX.chartFontFamily,
		fontSize: 12,
		fontFill: '#009ed8',
}

function getGannFans(options) {
  const {
    chartId,
    ref,
    mode,
    config,
    update,
  } = options

  const key = `${type}_${chartId}`
  const fans = config[key] || []

  if (!(mode === 'gannFan' || fans.length)) {
    return null
  }

  return (
    <GannFan
      ref={el => ref(type, chartId, el)}
      enabled={mode === 'gannFan'}
      appearance={appearance}
      onComplete={value => update({ [key]: value })}
      fans={fans}
    />
  )
}

export default getGannFans
