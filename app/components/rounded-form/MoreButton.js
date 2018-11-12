import React from 'react'
import cn from 'classnames'

import GenericControl, { GenericProps } from './GenericControl'

import styles from './MoreButton.scss'


export type Props = {
  ...GenericProps,
  onClick?: () => boolean
}

export default class MoreButton extends GenericControl {
  props: Props

  onClickHandler(event) {
    event.stopPropagation()
    if (this.props.onClick) {
      this.props.onClick(event)
    }
    return false
  }

  renderControl() {
    return (
      <div className={cn(styles.more, this.props.className)}>
        <span
          role="none"
          className={styles.button}
          onClick={e => this.onClickHandler(e)}
          onKeyDown={e => [13, 32].includes(e.keyCode) ? this.onClickHandler(e) : false}
          onContextMenu={e => this.onClickHandler(e)}
        />

      </div>
    )
  }
}
