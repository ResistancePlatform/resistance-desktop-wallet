import { Decimal } from 'decimal.js'

import { DECIMAL } from '~/constants/decimal'

function truncateAmount(amount: Decimal) {
  return amount.abs().toFixed(DECIMAL.fractionalDigitsNumber, Decimal.ROUND_FLOOR)
}

export {
  truncateAmount
}
