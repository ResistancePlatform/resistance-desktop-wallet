// @flow
import React, { Component } from 'react'
import * as owasp from 'owasp-password-strength-test'

import styles from './PasswordStrength.scss'

type StrengthStatus = null | 'weak' | 'medium' | 'good' | 'excellent'

const statusMessage: { [StrengthStatus]: string } = {
  'weak': `Weak`,
  'medium': `Medium`,
  'good': `Good`,
  'excellent': `Excellent`
}

type Props = {
  +password: string | undefined
}

type State = {
  strengthRate: number,
  status: StrengthStatus
}

export default class PasswordStrength extends Component<Props> {
	props: Props
  state: State

	/**
	 * @memberof PasswordStrength
	 */
	constructor(props) {
		super(props)

    this.state = {
      strengthRate: 0,
      status: null
    }
	}

	/**
	 * @memberof PasswordStrength
	 */
  componentDidUpdate(prevProps) {
    if (prevProps.password !== this.props.password) {
      const result = owasp.test(this.props.password || '')
      console.error("Res", result)
      const strengthRate = Math.round(100 * result.passedTests.length / (result.passedTests.length + result.failedTests.length))

      let status = null

      if (result.strong) {
        status = 'excellent'
      } else {
        if (strengthRate <= 50) {
          status = 'weak'
        } else if (strengthRate <= 70) {
          status = 'medium'
        } else {
          status = 'good'
        }
      }

      /* eslint-disable-next-line react/no-did-update-set-state */
      this.setState({ strengthRate, status })
    }
  }

	/**
	 * @memberof PasswordStrength
	 */
	render() {
		return (
			<div className={styles.container}>
        Password strength: {this.state.strengthRate}
        <div className={this.state.status}>
          Message: {statusMessage[this.state.status] || ''}
        </div>
			</div>
		)
	}
}
