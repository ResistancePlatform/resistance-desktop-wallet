// @flow
import React, { Component } from 'react'
import classNames from 'classnames'

import styles from './RoundedInput.scss'

type Props = {
	name?: string,
  +value: string,
	+onChange: value => void,
	disabled?: boolean,
  error?: string | null
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
          className={classNames(styles.roundedInputContainer, {[styles.error]: Boolean(this.props.error)})}
          name={this.props.name}
          disabled={this.props.disabled}
        >
          <textarea
            disabled={this.props.disabled}
            onChange={event => this.onChangeHandler(event)}
          >
            {this.props.value}
          </textarea>
        </div>
        {this.props.error &&
          <div className={styles.errorMessage}>{this.props.error}</div>
        }
      </div>
		)
	}
}
