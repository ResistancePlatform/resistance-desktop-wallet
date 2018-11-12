// @flow
import React, { Component } from 'react'
import cn from 'classnames'

import styles from './Address.scss'


type Props = {
  className?: string,
  value: string
}

export class Address extends Component<Props> {
	props: Props

  getValue() {
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

    return `${left}…${right}`
  }

	render() {
		return (
      <div className={cn(styles.address, this.props.className)}>
        {this.getValue()}

        <div ref={el => {this.element = el}} style={{visibility: 'hidden', height: 0, overflowY: 'hidden'}}>
          {this.props.value}
        </div>

      </div>
    )
  }
}
