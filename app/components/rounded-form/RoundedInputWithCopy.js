import React from 'react'
import { clipboard } from 'electron'
import cn from 'classnames'
import { toastr } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import RoundedInput from './NewRoundedInput'
import styles from './RoundedInputWithButton.scss'


const t = translate('other')

export default class RoundedInputWithCopy extends RoundedInput {
  copyValue() {
    clipboard.writeText(this.state.value)
    toastr.success(t(`Copied to clipboard`))
  }

  renderAddon() {
    return (
      <div
        className={styles.button}
        onClick={() => this.copyValue()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
      >
        <div className={cn('icon', styles.icon)} />
        <div>{t(`Copy`)}</div>
      </div>
    )
  }
}
