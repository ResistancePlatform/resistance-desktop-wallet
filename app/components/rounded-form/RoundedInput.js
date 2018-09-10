// @flow
import { clipboard, remote } from 'electron'
import React, { Component } from 'react'
import classNames from 'classnames'

import styles from './RoundedInput.scss'

export type RoundedInputAddon = {
	enable: boolean,
	type: 'PASTE' | 'DROPDOWN' | 'TEXT_PLACEHOLDER' | 'CHOOSE_FILE',
  data?: { [string]: any },
	value: string | undefined,
	onClick?: addonType => void,
	onEnterPressed?: () => void
}

type Props = {
	name: string,
  defaultValue?: string,
	number?: boolean,
  password?: boolean,
	label: string,
	onChange?: value => void,
	addon?: RoundedInputAddon,
	disabled?: boolean,
	tooltip?: string,
  onEnterPressed: func,
  error?: string | null,
  readOnly?: boolean,
  important?: boolean,
	children: any
}

type State = {
  value: string,
  isFocused: boolean
}

export default class RoundedInput extends Component<Props> {
	props: Props
  state: State

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
    this.changeValue(event.target.value)
	}

	onFocusHandler() {
		this.setState({ isFocused: true })
	}

	onBlurHandler() {
		this.setState({ isFocused: false })
	}

	onAddonClick(event) {
    event.stopPropagation()

		if (this.props.addon.onClick && !this.props.disabled) {
			this.props.addon.onClick(this.props.addon.type)
      return false
		}

    if (this.props.addon.type === 'PASTE') {
      this.changeValue(clipboard.readText())
    }

    if (this.props.addon.type === 'CHOOSE_FILE') {
      const addonData = this.props.addon.data || {}
      const title = addonData.title || `Choose a file`

      const callback = filePaths => {
        if (filePaths && filePaths.length) {
          const value = filePaths.pop()
          this.changeValue(value)
        }
      }

      remote.dialog.showOpenDialog({
        title,
        defaultPath: addonData.defaultPath || remote.app.getPath('documents'),
        message: addonData.message || title,
        filters: addonData.filters
      }, addonData.callback || callback )
    }

    return false
	}

	onEnterPressedEventHandler(event) {
		if (event.key === 'Enter' && this.props.onEnterPressed) {
			this.props.onEnterPressed()
		}
	}

	renderAddon() {
		if (!this.props.addon || !this.props.addon.enable) {
			return null
		}

    if (this.props.addon.type === 'TEXT_PLACEHOLDER') {
			return (
				<span className={classNames(styles.addon, styles.text)}>
					{this.props.addon.value}
				</span>
			)
		}

    let content

    switch (this.props.addon.type) {
      case 'PASTE':
        content = (
          <div>
            <i className="icon-paste" />
            <span>PASTE</span>
          </div>
        )
        break
      case 'DROPDOWN':
        content = (
					<i className="icon-arrow-down" />
        )
        break
      case 'CHOOSE_FILE':
        content = (
					<i className="icon-folder-open" />
        )
        break
      default:
        content = null
    }

    return (
				<span
          role="none"
					className={classNames(styles.addon, styles[this.props.addon.type.toLowerCase()])}
					onClick={event => this.onAddonClick(event)}
					onKeyDown={event => this.onAddonClick(event)}
				>
          {content}
				</span>
			)
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
        <div
          name={this.props.name}
          disabled={this.props.disabled}
          className={classNames(
            styles.roundedInputContainer,
            {
              [styles.important]: this.props.important,
              [styles.error]: Boolean(this.props.error)
            }
          )}
        >
          <div className={styles.roundedInputLabel}>
            {this.props.label || ''}
          </div>

          <div className={classNames(styles.inputContainer)}>
            <input
              type={this.getInputType()}
              value={this.state.value}
              disabled={this.props.disabled}
              onChange={event => this.onChangeHandler(event)}
              onFocus={(event) => this.onFocusHandler(event)}
              onBlur={(event) => this.onBlurHandler(event)}
              onKeyPress={(event) => this.onEnterPressedEventHandler(event)}
              readOnly={this.props.readOnly}
            />
            {this.renderAddon()}
            {this.renderTooltip()}
          </div>
          {this.props.children ? this.props.children : null}
        </div>
        <div className={styles.errorMessage}>{this.props.error && !this.state.isFocused && this.props.error}</div>
      </div>
		)
	}
}
