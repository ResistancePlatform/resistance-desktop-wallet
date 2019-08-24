import React from 'react'
import { Decimal } from 'decimal.js'
import { InteractiveYCoordinate } from 'react-stockcharts/lib/interactive'
import log from 'electron-log'

import { translate } from '~/i18next.config'
import { RESDEX } from '~/constants/resdex'
import { toDecimalPlaces } from '~/utils/decimal'

const t = translate('service')
const interactiveType = 'InteractiveYCoordinate'

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
  text: t(`Order`),
}

function getOrders(options) {
  const {
    chartId,
    ref,
    orders,
    baseCurrency,
    quoteCurrency
  } = options

  log.debug({
    chartId,
    ref,
    orders,
    baseCurrency,
    quoteCurrency
  })

  if (!orders.length) {
    return null
  }

  const samePair = o => (
    o.baseCurrency === baseCurrency
    && o.quoteCurrency === quoteCurrency
  )

  const sameFlippedPair = o => (
    o.baseCurrency === quoteCurrency
    && o.quoteCurrency === baseCurrency
  )

  const description = o => {
    const isSamePair = samePair(o)

    const result = t(`{{type}} {{direction}} {{amount}} {{symbol1}} for {{symbol2}}`, {
      type: o.isMarket ? t(`Market`) : t(`Limit`),
      direction: isSamePair ? t(`buy`) : t(`sell`),
      amount: toDecimalPlaces(isSamePair ? o.baseCurrencyAmount : o.quoteCurrencyAmount),
      symbol1: isSamePair ? o.baseCurrency : o.quoteCurrency,
      symbol2: isSamePair ? o.quoteCurrency : o.baseCurrency
    })

    return result
  }

  const price = o => {
    if (!o.price) {
      return Decimal(0)
    }
    return samePair(o) ? o.price : Decimal(1).dividedBy(o.price)
  }

  const yCoordinateList = orders
    .filter(o => samePair(o) || sameFlippedPair(o))
    .map(o => ({
      ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
      id: o.uuid,
      yValue: Number(price(o).toString()),
      draggable: false,
      text: description(o),
      textFill: o.isMarket ? 'rgb(163, 103, 240)' : '#7557b4',
      stroke: samePair(o) ? '#009ed8' : '#e20063',
    }))

  return (
    <InteractiveYCoordinate
      ref={el => ref(interactiveType, chartId, el)}
      yCoordinateList={yCoordinateList}
      defaultPriceCoordinate={defaultPriceCoordinate}
    />
  )
}

export default getOrders
