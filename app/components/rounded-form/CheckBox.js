import React from 'react'
import cn from 'classnames'
import { v4 as uuid } from 'uuid'

import GenericControl, { GenericProps } from './GenericControl'

import styles from './CheckBox.scss'


export type CheckBoxProps = {
  ...GenericProps,
  name?: string,
  defaultValue?: boolean,
	onChange?: value => void
}

export type CheckBoxState = {
  value: boolean
}

export default class CheckBox extends GenericControl {
  props: CheckBoxProps
  state: CheckBoxState
  checkBoxId: string

	/**
	 * @param {*} props
	 * @memberof CheckBox
	 */
	constructor(props) {
		super(props)

    this.state = {
      value: props.defaultValue || false
    }

    this.checkBoxId = `checkbox-${uuid()}`
	}

	onClickHandler(event) {
		event.stopPropagation()

    const { value } = this.state
    this.setState({ value: !value })

		if (this.props.onChange) {
			this.props.onChange(!value)
		}

    return false
	}

  renderControl() {
    return (
      <div className={cn(styles.checkbox, this.props.className)}>
        <label htmlFor={this.props.checkBoxId}>
          <input
            id={this.props.checkBoxId}
            type="checkbox"
            name={this.props.name}
            checked={this.state.value}
            onClick={e => this.onClickHandler(e)}
            onKeyDown={e => [13, 32].includes(e.keyCode) ? this.onClickHandler(e) : false}
          />
          {this.props.children && this.props.children}
        </label>
      </div>
    )
  }
}
