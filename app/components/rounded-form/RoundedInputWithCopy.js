import React from 'react'
import { clipboard } from 'electron'
import cn from 'classnames'

import { translate } from '~/i18next.config'
import RoundedInput from './NewRoundedInput'
import styles from './RoundedInputWithCopy.scss'


const t = translate('other')

export default class RoundedInputWithCopy extends RoundedInput {
  static get displayName() { return 'RoundedInputWithCopy' }

  renderAddon() {
    return (
      <div
        className={styles.copyButton}
        onClick={() => clipboard.writeText(this.state.value)}
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
