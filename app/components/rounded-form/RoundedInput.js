import React from 'react'
import cn from 'classnames'

import GenericInput, { GenericInputProps, GenericInputState  } from './GenericInput'

import styles from './RoundedInput.scss'


export type RoundedInputProps = {
  ...GenericInputProps,
	name: string,
  defaultValue?: string,
  placeholder?: string,
  type: 'text' | 'number' | 'password',
  min?: number,
  max?: number,
  step?: number,
  readOnly?: boolean
}

type RoundedInputState = {
  ...GenericInputState,
  isFocused: boolean
}

export default class RoundedInput extends GenericInput {
  props: RoundedInputProps
  state: RoundedInputState

	/**
	 * @param {*} props
	 * @memberof RoundedInput
	 */
	constructor(props) {
		super(props)
    this.state.isFocused = false
	}

	onFocusHandler() {
		this.setState({ isFocused: true })
	}

	onBlurHandler() {
		this.setState({ isFocused: false })
	}

  onClickHandler() {
  }

  renderInput() {
    return (
      <input
        className={cn(
          styles.input,
          { [styles.withPlaceholder]: Boolean(this.props.placeholder) }
        )}
        name={this.props.name}
        type={this.props.type}
        value={this.state.value}
        disabled={this.props.disabled}
        onChange={event => this.onChangeHandler(event)}
        onFocus={event => this.onFocusHandler(event)}
        onBlur={event => this.onBlurHandler(event)}
        onClick={event => this.onClickHandler(event)}
        placeholder={this.props.placeholder}
        readOnly={this.props.readOnly}
        min={this.props.min}
        max={this.props.max}
        step={this.props.step}
      />
    )
  }
}
