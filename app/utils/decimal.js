import { Decimal } from 'decimal.js'

import { DECIMAL } from '~/constants/decimal'

// TODO: rename to toFixed()
function truncateAmount(amount: Decimal) {
  return amount.abs().toFixed(DECIMAL.fractionalDigitsNumber, Decimal.ROUND_FLOOR)
}

function toDecimalPlaces(amount: Decimal, places: number = 6) {
  return amount.toDP(places, Decimal.ROUND_FLOOR).toString()
}

function flattenDecimals(object) {
  const result = {}

  Object.keys(object).forEach(key => {
    const value = object[key]

    result[key] = value && typeof value === typeof Decimal(0)
      ? Number(value.toString())
      : value
  })

  return result
}

export {
  truncateAmount,
  toDecimalPlaces,
  flattenDecimals
}
