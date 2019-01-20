import React from 'react'
import cn from 'classnames'

import CheckBox, { CheckBoxProps } from './CheckBox'

import styles from './ToggleButton.scss'


export type Props = {
  ...CheckBoxProps,
  label?: string,
  value?: string,
  captions?: string[]
}

export default class ToggleButton extends CheckBox {
  props: Props

  render() {
    const [onCaption, offCaption] = this.props.captions || []

    return (
      <div className={cn(styles.wrapper, this.props.className)}>
        {this.props.label &&
          <div className={cn(styles.label, this.props.labelClassName)}>
            {this.props.label}
          </div>
        }

        <div
          role="button"
          tabIndex={0}
          className={cn(styles.container, {
            [styles.on]: this.props.value !== undefined ? this.props.value : this.state.value,
            [styles.disabled]: this.props.disabled
          })}
          onClick={e => this.onClickHandler(e)}
          onKeyDown={e => [13, 32].includes(e.keyCode) ? this.onClickHandler(e) : false}
        >
          <div className={styles.switcher} />

          <div className={styles.caption}>
            {(this.state.value ? onCaption : offCaption) || ''}
          </div>

        </div>

      </div>
    )
  }
}
