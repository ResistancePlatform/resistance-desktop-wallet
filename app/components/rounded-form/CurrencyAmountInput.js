import { Decimal } from 'decimal.js'
import React from 'react'
import cn from 'classnames'

import { translate } from '~/i18next.config'
import RoundedInput, { RoundedInputProps } from './NewRoundedInput'

import parentStyles from './NewRoundedInput.scss'
import styles from './CurrencyAmountInput.scss'


const t = translate('other')

type CurrencyAmountInputProps = {
  ...RoundedInputProps,
  maxAmount?: object,
  buttonLabel?: string,
  symbol: string,
  step?: string
}

export default class CurrencyAmountInput extends RoundedInput {
  props: CurrencyAmountInputProps

  renderLabel() {
    return (
      this.props.label
    )
  }

  renderInput() {
    return (
      <div className={styles.inputContainer}>
        <input
          className={cn(parentStyles.input, styles.input)}
          name={this.props.name}
          type="number"
          step={this.props.step}
          min="0"
          value={this.state.value}
          disabled={this.props.disabled}
          onChange={event => this.onChangeHandler(event)}
          onFocus={(event) => this.onFocusHandler(event)}
          onBlur={(event) => this.onBlurHandler(event)}
          placeholder={this.props.placeholder}
          readOnly={this.props.readOnly}
        />
        {this.props.symbol}
      </div>
    )
  }

  renderAddon() {
    if (!this.props.maxAmount) {
      return null
    }

    const decimalPlaces = this.props.symbol === 'USD' ? 2 : 8
    const maxValue = this.props.maxAmount.toDP(decimalPlaces, Decimal.ROUND_FLOOR)

    return (
      <div className={styles.buttonWrapper}>
        <button
          type="button"
          className={styles.maxButton}
          onClick={() => this.changeValue(maxValue.toString())}
          onKeyDown={() => false}
        >
          {this.props.buttonLabel || t(`Max`)}
        </button>
      </div>
    )
  }
}
