// @flow
import React, { Component } from 'react'
import test from 'owasp-password-strength-test'

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
      const result = test(this.props.password || '')
      const strengthRate = Math.Round(100 * result.passedtests.length / (result.passedtests.length + result.failedTests.length))

      let status = null

      if (result.strong) {
        status = 'excellent'
      } else {
        if (strengthRate <= 30) {
          status = 'weak'
        } else if (strengthRate <= 50) {
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
        <span className={this.state.status}>
          Message: {statusMessage[this.state.status] || ''}
        </span>
			</div>
		)
	}
}
