import React from 'react'

import RoundedInput, { RoundedInputProps } from './NewRoundedInput'
import RoundedInput from './NewRoundedInput'

import styles from './RoundedInputWithDropdown.scss'


export default class RoundedInputWithDropdown extends RoundedInput {
  renderAddon() {
    return (
      <div
        className={styles.dropdownIcon}
      />
    )
  }
}
