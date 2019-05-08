import React from 'react'
import cn from 'classnames'

import { RoundedInputProps } from './RoundedInput'
import CurrencyAmountInput from './CurrencyAmountInput'

import styles from './PriceInput.scss'


type PriceInputProps = {
  ...RoundedInputProps,
  baseCurrency: string,
  quoteCurrency: string,
  bestPrice: object | null,
  step?: string
}

export default class PriceInput extends CurrencyAmountInput {
  props: PriceInputProps

  renderInputPrefix() {
    return (
      <div className={cn(styles.inputPrefix, {[styles.visible]: Boolean(this.state.value)})} />
    )
  }

  renderCurrency() {
    const { baseCurrency, quoteCurrency } = this.props
    return `${baseCurrency}/${quoteCurrency}`
  }

  renderAddon() {
    return (
      <div className={styles.buttonWrapper}>
        <div
          role="button"
          className={cn('icon', styles.setBestPriceButton)}
          tabIndex={0}
          onClick={() => this.props.bestPrice && this.changeValue(this.props.bestPrice.toString())}
          onKeyDown={() => false}
        />
      </div>
    )
  }
}

