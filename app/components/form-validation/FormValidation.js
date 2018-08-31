// @flow
import { Component } from 'react'
import * as Joi from 'joi'

type Props = {
  schema: object,
  fields: { [string]: any },
  onValidate: (errors: object) => void
}

export class FormValidation extends Component<Props> {
	props: Props

	/**
	 * @memberof FormValidation
	 */
	componentDidMount() {
    this.validate()
  }

	/**
	 * @param {*} prevProps
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
        errors[item.path.pop()] = item.message
        return errors
      }, {})
    }

    this.props.onValidate(validationErrors)
  }

}
