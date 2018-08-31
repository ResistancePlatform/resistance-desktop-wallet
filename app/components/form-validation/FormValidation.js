// @flow
import { Component } from 'react'
import { connect } from 'react-redux'
import * as Joi from 'joi'

type Props = {
  schema: object,
  fields: { [string]: any },
  onValidate: (errors: object) => void
}

class FormValidation extends Component<Props> {
	props: Props

	/**
	 * @memberof FormValidation
	 */
	componentDidMount() {
    this.validate()
  }

	/**
	 * @memberof FormValidation
	 */
  componentDidUpdate() {
    this.validate()
  }

  validate() {
    let validationErrors = {}

    if (!this.props.fields) {
      return
    }

    const {error} = Joi.validate(this.props.fields, this.props.schema, { abortEarly: false })

    if (error !== null) {
      validationErrors = error.details.reduce((errors, item) => {
        const path = item.path.pop()
        errors[path] = item.message
        return errors
      }, {})
    }

    this.props.onValidate(validationErrors)
  }

	/**
	 * @memberof FormValidation
	 */
  render() {
    return null
  }

}

export default connect()(FormValidation)
