// @flow
import log from 'electron-log'
import React from 'react'
import cn from 'classnames'
import { v4 as uuid } from 'uuid'

import GenericControl, { GenericProps } from './GenericControl'

import styles from './RadioButton.scss'


export type RadioButtonProps = {
  ...GenericProps,
  name?: string,
  defaultChecked?: boolean,
  value: any,
	onChange?: value => void
}

export type RadioButtonState = {
  value: any
}

export default class RadioButton extends GenericControl  {
  props: RadioButtonProps
  state: RadioButtonState
  radioId: string

	/**
	 * @param {*} props
	 * @memberof RadioButton
	 */
	constructor(props) {
		super(props)

    this.state = {
      value: props.value
    }

    this.radioId = `radio-${uuid()}`
	}

	onClickHandler(event) {
		event.stopPropagation()

    const { value } = event.target
    this.setState({ value })

    log.debug('onChange', this.props.onChange, event.target.value)
		if (this.props.onChange) {
			this.props.onChange(value)
		}

    return false
	}

  renderControl() {
    return (
      <div className={cn(styles.radio, this.props.className)}>
        <label htmlFor={this.props.radioId}>
          <input
            id={this.radioId}
            type="radio"
            name={this.props.name}
            value={this.props.value}
            defaultChecked={this.props.defaultChecked}
            onClick={e => this.onClickHandler(e)}
            onKeyDown={e => [13, 32].includes(e.keyCode) ? this.onClickHandler(e) : false}
          />
          {this.props.children && this.props.children}
        </label>
      </div>
    )
  }
}
