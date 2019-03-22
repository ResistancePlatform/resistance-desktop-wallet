import React from 'react'
import cn from 'classnames'

import RoundedButton, { RoundedButtonProps } from './RoundedButton'

import styles from './RoundedButtonWithDropdown.scss'


export type Props = {
  ...RoundedButtonProps,
  onDropdownClick: () => boolean
}

export default class RoundedButtonWithDropdown extends RoundedButton {
  props: Props

  onClickHandler(event) {
    if (!this.props.onClick) {
      return this.onDropdownClickHandler(event)
    }
    return super.onClickHandler(event)
  }

  onDropdownClickHandler(event) {
    event.stopPropagation()
    this.props.onDropdownClick(event)
    return false
  }

  renderAddon() {
    return (
      <div
        role="button"
        tabIndex={0}
        className={styles.dropdownButton}
        onClick={e => this.onDropdownClickHandler(e)}
        onKeyDown={e => [13, 32].includes(e.keyCode) ? this.onDropdownClickHandler(e) : false}
      >
        <div className={cn('icon', styles.icon)} />
      </div>
    )
  }
}
