import React from 'react'
import { InteractiveYCoordinate } from 'react-stockcharts/lib/interactive'

import { translate } from '~/i18next.config'
import { RESDEX } from '~/constants/resdex'

const t = translate('service')
const type = 'InteractiveYCoordinate'

const defaultPriceCoordinate = {
  ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
  edge: {
    ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
			stroke: 'rgb(163, 103, 240)',
			fill: 'rgb(21, 26, 53)',
  },
  bgFill: 'rgb(21, 26, 53)',
  stroke: 'rgb(163, 103, 240)',
  textFill: 'rgb(163, 103, 240)',
  fontFamily: RESDEX.chartFontFamily,
  text: t(`Alert`),
}

const hoverText = {
  ...InteractiveYCoordinate.defaultProps.hoverText,
  text: t(`Click and drag the edge circles`),
}

function getAlerts(options) {
  const {
    chartId,
    ref,
    mode,
    config,
    update,
  } = options

  const key = `${type}_${chartId}`
  const yCoordinateList = config[key] || []

  if (!(mode === 'alert' || yCoordinateList.length)) {
    return null
  }

  const onDelete = yCoordinate => {
    const newYCoordinateList = yCoordinateList.filter(item => item.id !== yCoordinate.id)
    update({ [key]: newYCoordinateList })
  }

  return (
    <InteractiveYCoordinate
      ref={el => ref(type, chartId, el)}
      enabled={mode === 'alert'}
      onDragComplete={value => update({ [key]: value })}
      onDelete={yCoordinate => onDelete(yCoordinate)}
      yCoordinateList={yCoordinateList}
      defaultPriceCoordinate={defaultPriceCoordinate}
      hoverText={hoverText}
    />
  )
}

export default getAlerts
