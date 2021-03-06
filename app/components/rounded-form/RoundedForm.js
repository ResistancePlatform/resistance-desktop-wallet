// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import * as Joi from 'joi'

import { i18n } from '~/i18next.config'
import { RoundedFormState, RoundedFormActions } from '~/reducers/rounded-form/rounded-form.reducer'

const inputChildComponentNames = ['RoundedInput', 'RoundedTextArea', 'ChooseWalletInput', 'Connect(ChooseWalletInput)']

type Props = {
  actions: object,
  roundedForm: RoundedFormState,
  +id: string,
  className?: string,
  schema?: object,
  options?: object,
  onValidate?: (errors: object) => void,
  important?: boolean,
  overrideOnMount?: boolean,
  clearOnUnmount?: boolean,
  children: any
}

/* Basic usage:
 * https://github.com/ResistancePlatform/resistance-desktop-wallet/wiki/RoundedForm
 */
class RoundedForm extends Component<Props> {
	props: Props
  defaultValues: object

	/**
	 * @memberof RoundedForm
	 */
  constructor(props) {
    super(props)
    this.defaultValues = {}
  }

	/**
	 * @memberof RoundedForm
	 */
  componentDidMount() {
    if (!this.props.overrideOnMount && this.props.roundedForm[this.props.id]) {
      return
    }
    this.props.actions.updateFields(this.props.id, this.defaultValues, false)
  }

	/**
	 * @memberof RoundedForm
	 */
  componentDidUpdate(prevProps) {
    const entries = Object.entries(this::getFormState().fields)

    const prevForm = prevProps.roundedForm[this.props.id]
    if (!prevForm) {
      return
    }

    const fields = entries.reduce((result, [key, value]) => {
      if (value !== prevForm.fields[key]) {
        result.push(key)
      }
      return result
    }, [])

    if (fields.length) {
      this.validate(fields)
    }
  }

  componentWillUnmount() {
    if (this.props.clearOnUnmount) {
      this.props.actions.clear(this.props.id)
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

    const language = i18n.getResourceBundle(i18n.language, 'validation')

    const options = Object.assign({ abortEarly: false, language }, this.props.options)

    const {error, value} = this.props.schema
      ? Joi.validate(stateFields, this.props.schema, options)
      : {error: null, value: {...stateFields}}

    if (error === null) {
      // Put cleaned up field values in the store
      if (JSON.stringify(value) !== JSON.stringify(stateFields)) {
        this.props.actions.updateFields(this.props.id, value)
      }
    } else {
      validationErrors = error.details.reduce((stash, item) => {
        const path = item.path.pop()
        const errors = { ...stash }

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
  onResetHandler(originalHandler: func) {
    return (event) => {
      this.props.actions.updateFields(this.props.id, this.defaultValues, true)
      return originalHandler ? originalHandler(event) : false
    }
  }

	/**
	 * @memberof RoundedForm
	 */
  mapChildrenRecursively(children, fn) {
    return React.Children.map(children, child => {
      if (!React.isValidElement(child)) {
        return child
      }

      let childToMap = child

      if (child.props.children) {
        childToMap = React.cloneElement(child, {
          children: this.mapChildrenRecursively(child.props.children, fn)
        });
      }

      return fn(childToMap)
    })
  }

	/**
	 * @memberof RoundedForm
	 */
  renderChildren() {
    return this.mapChildrenRecursively(this.props.children, child => {

      // Handle form submission
      const isButton = (
        child.type === 'button'
        || child.props.role === 'button'
        || child.type.displayName === 'RoundedButton'
      )

      if (isButton && child.props.type === 'submit') {
        return React.cloneElement(child, {
          onClick: this.onSubmitHandler(child.props.onClick),
          onKeyDown: this.onSubmitHandler(child.props.onKeyDown)
        })
      }

      if (isButton && child.props.type === 'reset') {
        return React.cloneElement(child, {
          onClick: this.onResetHandler(child.props.onClick),
          onKeyDown: this.onResetHandler(child.props.onKeyDown)
        })
      }

      // Handle child inputs change events
      // TODO: leave only isRoundedFormComponent after moving all the components to the new system
      if (child.type.isRoundedFormComponent || inputChildComponentNames.includes(child.type.displayName)) {
        const formState = this::getFormState()

        const onChange = value => (
          this.props.actions.updateField(this.props.id, child.props.name, value)
        )

        const error = formState.errors[child.props.name]

        // Collect children default values to initialize the fields

        if (child.props.defaultValue) {
          this.defaultValues[child.props.name] = child.props.defaultValue
        }

        const getDefaultValue = () => {
          const defaultValue = formState.fields[child.props.name]
          if (defaultValue === null || defaultValue === undefined) {
            return child.props.defaultValue
          }
          return typeof defaultValue === 'boolean' ? defaultValue : defaultValue.toString()
        }

        return React.cloneElement(child, {
          onChange: child.props.onChange ? v => { child.props.onChange(v); onChange(v) } : onChange,
          error: child.props.error ? child.props.error : error,
          defaultValue: getDefaultValue(),
          important: child.props.important ? child.props.important : this.props.important
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
      <div className={this.props.className}>
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
