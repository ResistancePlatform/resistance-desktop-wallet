import React from 'react'
import { clipboard } from 'electron'
import cn from 'classnames'
import { toastr } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import GenericButton, { GenericButtonProps } from './GenericButton'

import styles from './BorderlessButton.scss'


export type RoundedButtonProps = {
  ...GenericButtonProps,
  valueToCopy: string
}

const t = translate('other')

export default class CopyButton extends GenericButton {
  copyValue(event) {
    event.stopPropagation()
    clipboard.writeText(this.props.valueToCopy)
    toastr.success(t(`Copied to clipboard`))
    return false
  }

  renderControl() {
    return (
      <div
        className={cn(styles.button, this.props.className)}
        onClick={e => this.copyValue(e)}
        onKeyDown={e => [13, 32].includes(e.keyCode) ? this.copyValue(e) : false}
        role="button"
        tabIndex={0}
      >
        <div className={cn('icon', styles.icon)} />
        <div>{t(`Copy`)}</div>
      </div>
    )
  }
}
