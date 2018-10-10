import { Decimal } from 'decimal.js'

import { DECIMAL } from '~/constants/decimal'

// TODO: rename to toFixed()
function truncateAmount(amount: Decimal) {
  return amount.abs().toFixed(DECIMAL.fractionalDigitsNumber, Decimal.ROUND_FLOOR)
}

function toDecimalPlaces(amount: Decimal, places: number = 4) {
  return amount.toDP(places, Decimal.ROUND_FLOOR).toString()
}

export {
  truncateAmount,
  toDecimalPlaces
}
