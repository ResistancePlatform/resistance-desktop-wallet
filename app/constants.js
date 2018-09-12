import { Decimal } from 'decimal.js'

// Auth
const AUTH = {
  sessionTimeoutSeconds: 1800
}

// Decimals
const AMOUNT_FRACTIONAL_DIGITS_NUMBER = 4
const TRANSACTION_FEE = Decimal('0.0001')

const truncateAmount = (amount: Decimal) => amount.abs().toFixed(AMOUNT_FRACTIONAL_DIGITS_NUMBER, Decimal.ROUND_FLOOR)

export {
  AUTH,
  AMOUNT_FRACTIONAL_DIGITS_NUMBER,
  TRANSACTION_FEE,
  truncateAmount
}
