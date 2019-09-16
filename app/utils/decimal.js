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

function toMaxDigits(amount, number: number = 10) {
  const maxDigitsAfterComma = 8
  const flattened = toDecimalPlaces(amount, maxDigitsAfterComma)

  if (flattened.length > number) {
    const digitsAfterComma = maxDigitsAfterComma - (flattened.length - number)
    return toDecimalPlaces(amount, Math.max(0, digitsAfterComma))
  }

  return flattened
}

export {
  truncateAmount,
  toDecimalPlaces,
  flattenDecimals,
  toMaxDigits
}
