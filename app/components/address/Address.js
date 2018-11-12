// @flow
import log from 'electron-log'
import React, { Component } from 'react'

type Props = {
  className?: string,
  value: string
}

export class Address extends Component<Props> {
	props: Props
  value: string

  constructor(props) {
    super(props)
    this.value = this.props.value
  }

  componentDidMount() {
    const { value } = this.props

    if (!this.element) {
      return
    }

    const { scrollWidth, clientWidth } = this.element

    if (scrollWidth <= clientWidth) {
      return value
    }

    // Calculate how many chars have to be cut out
    const averageCharWidth = scrollWidth / value.length
    const charsToCut = 1 + (scrollWidth - clientWidth) / averageCharWidth

    const left = value.slice(0, (value.length - charsToCut) / 2)
    const right = value.slice((value.length + charsToCut) / 2)

    log.debug('Address', scrollWidth, clientWidth, charsToCut, left.length, right.length)

    this.value = `${left}…${right}`
	}

	render() {
		return (
      <div
        className={this.props.className}
        style={{ whiteSpace: 'nowrap', userSelect: null }}
        ref={el => {this.element = el}}
      >
        {this.value}
      </div>
    )
  }
}
