import React from 'react'
import { InteractiveText } from 'react-stockcharts/lib/interactive'

import { RESDEX } from '~/constants/resdex'

const type = 'InteractiveText'

const defaultText = {
  bgFill: 'rgb(21, 26, 53)',
  bgOpacity: 1,
  bgStrokeWidth: 1,
  textFill: 'rgb(163, 103, 240)',
  fontFamily: RESDEX.chartFontFamily,
  fontSize: 12,
  fontStyle: 'normal',
  fontWeight: 'normal',
  text: 'Lorem ipsum...',
}

function getInteractiveTexts(options) {
  const {
    chartId,
    ref,
    mode,
    config,
    update,
  } = options

  const key = `${type}_${chartId}`
  const textList = config[key] || []

  if (!(mode === 'label' || textList.length)) {
    return null
  }

  return (
    <InteractiveText
      ref={el => ref(type, chartId, el)}
      enabled={mode === 'label'}
      defaultText={defaultText}
      text="Lorem ipsum..."
      onDragComplete={value => update({ [key]: value })}
      textList={textList}
    />
  )
}

export default getInteractiveTexts
