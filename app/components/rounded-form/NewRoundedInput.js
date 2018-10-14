import log from 'electron-log'
import React from 'react'
import GenericInput, { GenericProps } from './GenericInput'

import styles from './NewRoundedInput.scss'


export type RoundedInputProps = {
  ...GenericProps,
	name: string,
  defaultValue?: string,
  type: 'text' | 'number' | 'password',
  readOnly?: boolean
}

type RoundedInputState = {
  value: string,
  isFocused: boolean
}

export default class RoundedInput extends GenericInput {
  props: RoundedInputProps
  state: RoundedInputState

  static get displayName() { return 'RoundedInput' }

	/**
	 * @param {*} props
	 * @memberof RoundedInput
	 */
	constructor(props) {
		super(props)

    this.state = {
      value: props.defaultValue || '',
      isFocused: false
    }
	}

	/**
	 * @param {*} prevProps
	 * @memberof RoundedInput
	 */
  componentDidUpdate(prevProps) {
    if (prevProps.defaultValue !== this.props.defaultValue ) {
        /* eslint-disable-next-line react/no-did-update-set-state */
        this.setState({ value: this.props.defaultValue || '' })
    }
  }

	/**
	 * @param {string} value
	 * @memberof RoundedInput
	 */
  changeValue(value: string) {
    this.setState({ value })

		if (this.props.onChange) {
			this.props.onChange(value)
		}
  }

	onChangeHandler(event) {
		event.stopPropagation()
    log.debug('value', event.target.value)
    this.changeValue(event.target.value)
	}

	onFocusHandler() {
		this.setState({ isFocused: true })
	}

	onBlurHandler() {
		this.setState({ isFocused: false })
	}

  renderInput() {
    return (
      <input
        className={styles.input}
        name={this.props.name}
        type={this.props.type}
        value={this.state.value}
        disabled={this.props.disabled}
        onChange={event => this.onChangeHandler(event)}
        onFocus={(event) => this.onFocusHandler(event)}
        onBlur={(event) => this.onBlurHandler(event)}
        readOnly={this.props.readOnly}
      />
    )
  }
}
