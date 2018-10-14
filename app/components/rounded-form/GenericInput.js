// @flow
import log from 'electron-log'
import React, { Component } from 'react'
import cn from 'classnames'

import genericStyles from './GenericInput.scss'

export type GenericProps = {
  className?: string,
  labelClassName?: string,
  inputClassName?: string,
  addonClassName?: string,
	label?: string,
	onChange?: value => void,
	disabled?: boolean,
  error?: string | null,
	children: any
}

export default class GenericInput extends Component<Props> {
	props: GenericProps

  static get isRoundedFormComponent() { return true }
  static get displayName() { return 'GenericInput' }

	onChangeHandler(event) {
		event.stopPropagation()

		if (this.props.onChange) {
			this.props.onChange(event.target.value)
		}
	}

  renderLabel() {
    return this.props.label
  }

  renderInput() {
    log.error(`Generic input component cannot be used directly and should be inherited`)
    return null
  }

  renderAddon(){
    return null
  }

	render() {
		return (
      <div className={genericStyles.wrapper}>
        <div
          className={cn(
            this.props.className,
            genericStyles.container,
            { [genericStyles.hasError]: Boolean(this.props.error) }
          )}
          disabled={this.props.disabled}
        >

        {this.props.label &&
          <div className={cn(this.props.labelClassName, genericStyles.label)}>
            {this.renderLabel()}
          </div>
        }

        <div className={cn(this.props.inputClassName, genericStyles.input)}>
          {this.renderInput()}
        </div>

        <div className={cn(this.props.addonClassName, genericStyles.addon)}>
          {this.renderAddon()}
        </div>

        {this.props.children &&
          this.props.children}
        </div>

        <div className={genericStyles.error}>
          {this.props.error
            && !this.state.isFocused
            && this.props.error
          }
        </div>

      </div>
		)
	}
}

