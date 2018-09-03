// @flow
import React, { Component } from 'react'
import classNames from 'classnames'

import styles from './rounded-input.scss'

type RoundedInputAddon = {
	enable: boolean,
	type: 'PASTE' | 'DROPDOWN' | 'TEXT_PLACEHOLDER',
	value: string | undefined,
	onAddonClicked?: addonType => void,
	onEnterPressed?: () => void
}

type Props = {
	name: string,
  defaultValue?: string,
	number?: boolean,
  password?: boolean,
	label: string,
	onChange: value => void,
	addon: RoundedInputAddon,
	disabled?: boolean,
	tooltip?: string,
  onEnterPressed: func,
  error?: string | null,
	children: any
}

type State = {
  value: string,
  isFocused: boolean
}

export default class RoundedInput extends Component<Props> {
	props: Props
  state: State

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

	onChangeHandler(event) {
		event.stopPropagation()

    this.setState({ value: event.target.value })

		if (this.props.onChange) {
			this.props.onChange(event.target.value)
		}
	}

	onFocusHandler() {
		this.setState({ isFocused: true })
	}

	onBlurHandler() {
		this.setState({ isFocused: false })
	}

	onMyAddonClick(event) {
		event.preventDefault()
		event.stopPropagation()

		if (this.props.addon.onAddonClicked && !this.props.disabled) {
			this.props.addon.onAddonClicked(this.props.addon.type)
		}
	}

	onEnterPressedEventHandler(event) {
		if (event.key === 'Enter' && this.props.onEnterPressed) {
			this.props.onEnterPressed()
		}
	}

	renderAddon() {
		if (!this.props.addon.enable) {
			return null
		}

		if (this.props.addon.type === 'PASTE') {
			return (
				<span
					className={styles.roundedInputAddonPaste}
					onClick={event => this.onMyAddonClick(event)}
					onKeyDown={event => this.onMyAddonClick(event)}
				>
					<i className="icon-paste" />
					<span className={styles.addOnPaste}>PASTE</span>
				</span>
			)
		} else if (this.props.addon.type === 'DROPDOWN') {
			return (
				<span
					className={styles.roundedInputAddonDropdown}
					onClick={event => this.onMyAddonClick(event)}
					onKeyDown={event => this.onMyAddonClick(event)}
				>
					<i className="icon-arrow-down" />
				</span>
			)
		} else if (this.props.addon.type === 'TEXT_PLACEHOLDER') {
			return (
				<span className={styles.roundedInputAddonTextPlaceholder}>
					{this.props.addon.value}
				</span>
			)
		}
	}

  getInputType() {
    if (this.props.number) {
      return 'number'
    }

    if (this.props.password) {
      return 'password'
    }

    return 'text'
  }

	renderTooltip() {
    if (this.state.isFocused && this.props.tooltip) {
      return (
        <span className={styles.tooltip}>{this.props.tooltip}</span>
      )
    }

    return null
	}

	render() {
		return (
      <div>
        {this.props.error && !this.state.isFocused &&
          <div className={styles.roundedInputErrorMessage}>{this.props.error}</div>
        }
        <div
          name={this.props.name}
          disabled={this.props.disabled}
          className={classNames(styles.roundedInputContainer, {[styles.error]: Boolean(this.props.error)})}
        >
          <div className={styles.roundedInputLabel}>
            {this.props.label || ''}
          </div>

          <div className={classNames(styles.roundedInputTextArea)}>
            <input
              type={this.getInputType()}
              value={this.state.value}
              disabled={this.props.disabled}
              onChange={event => this.onChangeHandler(event)}
              onFocus={(event) => this.onFocusHandler(event)}
              onBlur={(event) => this.onBlurHandler(event)}
              onKeyPress={(event) => this.onEnterPressedEventHandler(event)}
            />
            {this.renderAddon()}
            {this.renderTooltip()}
          </div>
          {this.props.children ? this.props.children : null}
        </div>
      </div>
		)
	}
}
