import React from 'react'
import { clipboard } from 'electron'
import cn from 'classnames'

import { translate } from '~/i18next.config'
import RoundedInput from './NewRoundedInput'
import styles from './RoundedInputWithButton.scss'


const t = translate('other')

export default class RoundedInputWithCopy extends RoundedInput {
  renderAddon() {
    return (
      <div
        className={styles.button}
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
