// @flow
import React, { Component } from 'react'
import classNames from 'classnames'

import styles from './RoundedInput.scss'

type Props = {
	name?: string,
  rows?: number,
  cols?: number,
  defaultValue?: string | null,
	onChange?: value => void,
	disabled?: boolean,
  important?: boolean,
  error?: string | null,
  readOnly?: boolean
}

export default class RoundedTextArea extends Component<Props> {
	props: Props

	onChangeHandler(event) {
		event.stopPropagation()

		if (this.props.onChange) {
			this.props.onChange(event.target.value)
		}
	}

	render() {
		return (
      <div>
        <div
          className={classNames(
            styles.roundedInputContainer,
            {
              [styles.important]: this.props.important,
              [styles.error]: Boolean(this.props.error)
            }
          )}
          name={this.props.name}
          disabled={this.props.disabled}
        >
          <textarea
            rows={this.props.rows}
            cols={this.props.cols}
            disabled={this.props.disabled}
            onChange={event => this.onChangeHandler(event)}
            value={this.props.defaultValue || ''}
            readOnly={this.props.readOnly}
          />
        </div>
        <div className={styles.errorMessage}>{this.props.error && this.props.error}</div>
      </div>
		)
	}
}
