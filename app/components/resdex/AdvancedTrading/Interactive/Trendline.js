import React from 'react'
import { TrendLine } from 'react-stockcharts/lib/interactive'

function getBbIndicator(options) {
  const {
    chartId,
    mode,
    nodes,
    config,
    update,
  } = options

  const type = 'Trendline'

  return (
    <React.Fragment>
      <TrendLine
        ref={node => { nodes[`${type}_${chartId}`] = { type, chartId, node } }}
        enabled={mode === 'trendline'}
        type="RAY"
        snap={false}
        snapTo={d => [d.high, d.low]}
        onStart={() => console.log("START")}
        onComplete={update}
        trends={config}
      />
    </React.Fragment>
  )
}

export default getBbIndicator
