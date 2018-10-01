// @flow
import React, { Component } from 'react'
import cn from 'classnames'

import styles from './RoundedInput.scss'

type Props = {
  className?: string,
  labelClassName?: string,
	label?: string,
	name?: string,
  defaultValue?: string | null,
	onChange?: value => void,
	disabled?: boolean,
  readOnly?: boolean,
  important?: boolean,
	tooltip?: string,
  onEnterDown: func,
  error?: string | null,
	children: any
}

export default class GenericInput extends Component<Props> {
	props: Props

  static get displayName() { return 'GenericInput' }

	onChangeHandler(event) {
		event.stopPropagation()

		if (this.props.onChange) {
			this.props.onChange(event.target.value)
		}
	}

	render() {
		return (
      <div className={styles.container} disabled={this.props.disabled} >
      </div>
		)
	}
}

