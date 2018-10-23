import React, { Component } from 'react'
import cn from 'classnames'

import styles from './ToggleButton.scss'


export type Props = {
	onChange?: value => void,
  defaultValue?: boolean,
	disabled?: boolean,
  captions?: string[]
}

type State = {
  value: boolean
}

export default class ToggleButton extends Component<Props> {
  props: Props
  state: State

	/**
	 * @param {*} props
	 * @memberof ToggleButton
	 */
	constructor(props) {
		super(props)

    this.state = {
      value: props.defaultValue || false
    }
	}

	onToggleHandler(event) {
		event.stopPropagation()

    const { value } = this.state
    this.setState({ value: !value })

		if (this.props.onChange) {
			this.props.onChange(!value)
		}

    return false
	}

  render() {
    const [onCaption, offCaption] = this.props.captions || []

    return (
        <div
          role="button"
          tabIndex={0}
          className={cn(styles.container, { [styles.on]: this.state.value, [styles.disabled]: this.props.disabled })}
          onClick={e => this.onToggleHandler(e)}
          onKeyDown={e => [13, 32].includes(e.keyCode) ? this.onToggleHandler(e) : false}
        >
          <div className={styles.switcher} />

          <div className={styles.caption}>
            {(this.state.value ? onCaption : offCaption) || ''}
          </div>
        </div>

    )
  }
}
