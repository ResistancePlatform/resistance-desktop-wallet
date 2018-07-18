// @flow
import React, { Component } from 'react'

import styles from './own-address-list.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'

type Props = {

}

export default class OwnAddressList extends Component<Props> {
  props: Props

  render() {
    return (
      <div className={[VLayout.vBoxChild, styles.ownAddressListContainer].join(' ')} data-tid="transaction-list-container">
        <div className={styles.title}>Transactions</div>
        Own Address List Here
      </div>
    )
  }
}
