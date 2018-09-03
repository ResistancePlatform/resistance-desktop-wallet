// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as Joi from 'joi'

type Props = {
  className?: string,
  schema: object,
  fields: { [string]: any },
  onValidate: (errors: object) => void,
  children: any
}

class RoundedForm extends Component<Props> {
	props: Props

	/**
	 * @memberof RoundedForm
	 */
  componentDidUpdate(prevProps) {
    const entries = Object.entries(this.props.fields)

    const fields = entries.reduce((result, [key, value]) => {
      if (value !== prevProps.fields[key]) {
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

    if (!this.props.fields) {
      return
    }

    const {error} = Joi.validate(this.props.fields, this.props.schema, { abortEarly: false })

    if (error !== null) {
      validationErrors = error.details.reduce((errors, item) => {
        const path = item.path.pop()

        if (fields === null || fields.includes(path)) {
          errors[path] = item.message
        }

        return errors
      }, {})
    }

    this.props.onValidate(validationErrors)

    return !error
  }

	/**
	 * @memberof RoundedForm
	 */
  onSubmitHandler(originalHandler: func) {
    return () => {
      if (this.validate(null) && originalHandler) {
        return originalHandler()
      }
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
      if (child.type === 'button' && child.props.type === 'submit') {
        return React.cloneElement(child, {
          onClick: this.onSubmitHandler(child.props.onClick),
          onKeyDown: this.onSubmitHandler(child.props.onKeyDown)
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

export default connect()(RoundedForm)
