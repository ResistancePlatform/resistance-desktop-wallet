// @flow
import log from 'electron-log'
import React, { Component } from 'react'
import cn from 'classnames'

import genericStyles from './GenericInput.scss'

type GenericProps = {
  className?: string,
  labelClassName?: string,
	label?: string,
	name?: string,
  defaultValue?: string | null,
	onChange?: value => void,
	disabled?: boolean,
  readOnly?: boolean,
	title?: string,
  error?: string | null,
	children: any
}

export default class GenericInput extends Component<Props> {
	props: GenericProps

  static get displayName() { return 'GenericInput' }

	onChangeHandler(event) {
		event.stopPropagation()

		if (this.props.onChange) {
			this.props.onChange(event.target.value)
		}
	}

  appendContent() {
    return null
  }

  renderContent() {
    log.error(`Generic input component cannot be used directly and should be inherited`)
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
            {this.props.label}
          </div>
        }

        <div className={genericStyles.content}>
          {this.renderContent()}
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

