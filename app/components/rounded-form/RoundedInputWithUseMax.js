import { Decimal } from 'decimal.js'
import React from 'react'
import cn from 'classnames'

import { translate } from '~/i18next.config'
import RoundedInput, { RoundedInputProps } from './NewRoundedInput'

import parentStyles from './NewRoundedInput.scss'
import styles from './RoundedInputWithUseMax.scss'


const t = translate('other')

type Props = {
  ...RoundedInputProps,
  maxAmount: any,
  symbol: string
}

export default class RoundedInputWithUseMax extends RoundedInput {
  props: Props

  static get displayName() { return 'RoundedInputWithUseMax' }

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
          step="0.1"
          min="0"
          value={this.state.value}
          disabled={this.props.disabled}
          onChange={event => this.onChangeHandler(event)}
          onFocus={(event) => this.onFocusHandler(event)}
          onBlur={(event) => this.onBlurHandler(event)}
          readOnly={this.props.readOnly}
        />
        {this.props.symbol}
      </div>
    )
  }
  renderAddon() {
    const maxValue = this.props.maxAmount.toDP(8, Decimal.ROUND_FLOOR).toString()

    return (
      <div className={styles.buttonWrapper}>
        <button
          type="button"
          className={styles.useMaxButton}
          onClick={() => this.changeValue(maxValue)}
          onKeyDown={() => false}
        >
          {t(`Use max`)}
        </button>
      </div>
    )
  }
}
