import React from 'react'
import cn from 'classnames'

import GenericButton, { GenericButtonProps } from './GenericButton'

import styles from './MoreButton.scss'


export type MoreButtonProps = {
  ...GenericButtonProps,
  large?: boolean
}

export default class MoreButton extends GenericButton {
  props: MoreButtonProps

  renderControl() {
    return (
      <div className={cn(styles.more, this.props.className)}>
        <span
          role="none"
          className={cn(styles.button, {[styles.large]: this.props.large})}
          onClick={e => this.onClickHandler(e)}
          onKeyDown={e => [13, 32].includes(e.keyCode) ? this.onClickHandler(e) : false}
          onContextMenu={e => this.onClickHandler(e)}
        />

      </div>
    )
  }
}
