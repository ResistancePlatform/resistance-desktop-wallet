// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import * as Joi from 'joi'

import { RoundedFormState, RoundedFormActions } from '~/state/reducers/rounded-form/rounded-form.reducer'

const inputChildComponentNames = ['RoundedInput', 'RoundedTextArea']

type Props = {
  actions: object,
  roundedForm: RoundedFormState,
  +id: string,
  className?: string,
  schema: object,
  onValidate?: (errors: object) => void,
  children: any
}

/* Basic usage:
 * https://github.com/ResistancePlatform/resistance-desktop-wallet/wiki/RoundedForm
 */
class RoundedForm extends Component<Props> {
	props: Props

	/**
	 * @memberof RoundedForm
	 */
  componentDidMount() {
    this.props.actions.init(this.props.id)
  }

	/**
	 * @memberof RoundedForm
	 */
  componentDidUpdate(prevProps) {
    const entries = Object.entries(this::getFormState().fields)

    const fields = entries.reduce((result, [key, value]) => {
      if (value !== prevProps.roundedForm[this.props.id].fields[key]) {
        result.push(key)
      }
      return result
    }, [])

    if (fields.length) {
      this.validate(fields)
    }
  }

	/**
	 * @memberof RoundedForm
	 */
  validate(fields: string[] | null): boolean {
    let validationErrors = {}
    const stateFields = this::getFormState().fields

    if (!stateFields) {
      return
    }

    const {error} = Joi.validate(stateFields, this.props.schema, { abortEarly: false })

    if (error !== null) {
      validationErrors = error.details.reduce((errors, item) => {
        const path = item.path.pop()

        if (fields === null || fields.includes(path)) {
          errors[path] = item.message
        }

        return errors
      }, {})
    }

    if (this.props.onValidate) {
      this.props.onValidate(validationErrors)
    }

    const isValid = !error
    this.props.actions.updateErrors(this.props.id, validationErrors, isValid)

    return isValid
  }

	/**
	 * @memberof RoundedForm
	 */
  onSubmitHandler(originalHandler: func) {
    return (event) => {
      if (this.validate(null)) {
        return originalHandler ? originalHandler(event) : undefined
      }
      event.preventDefault()
      return false
    }
  }

	/**
	 * @memberof RoundedForm
	 */
  mapChildrenRecursively(children, fn) {
    return React.Children.map(children, child => {
      if (!React.isValidElement(child)) {
        return child;
      }

      if (child.props.children) {
        child = React.cloneElement(child, {
          children: this.mapChildrenRecursively(child.props.children, fn)
        });
      }

      return fn(child);
    });
  }

	/**
	 * @memberof RoundedForm
	 */
  renderChildren() {
    return this.mapChildrenRecursively(this.props.children, child => {

      // Handle form submission
      if ((child.type === 'button' || child.props.role === 'button') && child.props.type === 'submit') {
        return React.cloneElement(child, {
          onClick: this.onSubmitHandler(child.props.onClick),
          onKeyDown: this.onSubmitHandler(child.props.onKeyDown)
        })
      }

      // Handle child inputs change events
      if (inputChildComponentNames.includes(child.type.displayName)) {
        const formState = this::getFormState()

        const onChange = (value) => (
          this.props.actions.updateField(this.props.id, child.props.name, value)
        )

        const error = formState.errors[child.props.name]
        const defaultValue = formState.fields[child.props.name]

        return React.cloneElement(child, {
          onChange: child.props.onChange ? child.props.onChange : onChange,
          error: child.props.error ? child.props.error : error,
          defaultValue: child.props.defaultValue ? child.props.defaultValue : defaultValue
        })
      }

      return child
    })
  }

	/**
	 * @memberof RoundedForm
	 */
  render() {
    return (
      <div
        className={this.props.className}
      >
        {this.renderChildren()}
      </div>
    )
  }

}

/**
 * Private method. Returns current form state.
 *
 * @memberof RoundedForm
 */
function getFormState() {
    return this.props.roundedForm[this.props.id] || { fields: {}, errors: {} }
}

const mapStateToProps = state => ({
	roundedForm: state.roundedForm
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(RoundedFormActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(RoundedForm)
