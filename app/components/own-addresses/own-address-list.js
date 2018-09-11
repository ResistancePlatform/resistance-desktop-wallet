// @flow
import React, { Component } from 'react'

import { truncateAmount } from '~/constants'
import { UniformList, UniformListHeader, UniformListRow, UniformListColumn} from '~/components/uniform-list'
import { AddressRow } from '~/state/reducers/own-addresses/own-addresses.reducer'

import styles from './own-address-list.scss'

type Props = {
	items: AddressRow[],
  frozenAddresses: { [string]: Decimal },
	onRowClick: (event: any, address: string) => void
}

export default class OwnAddressList extends Component<Props> {
	props: Props

  getListHeaderRenderer() {
    return (
      <UniformListHeader>
        <UniformListColumn width="22%">Balance</UniformListColumn>
        <UniformListColumn width="18%">Confirmed</UniformListColumn>
        <UniformListColumn width="60%">Address</UniformListColumn>
      </UniformListHeader>
    )
  }

  getListRowRenderer(address: AddressRow) {
    const frozenBalance = this.props.frozenAddresses[address.address]
    const balance = frozenBalance === undefined ? address.balance : frozenBalance
    const displayBalance = balance === null ? 'ERROR' : truncateAmount(balance)

    return (
      <UniformListRow
        key={address.address}
        className={frozenBalance ? styles.mergingContainer : ''}
        onContextMenu={e => this.props.onRowClick(e, address.address)}
      >
        {Boolean(frozenBalance) &&
          <div className={styles.merging}><span>merging</span></div>
        }
        <UniformListColumn>{displayBalance}</UniformListColumn>
        <UniformListColumn>{address.confirmed ? 'YES' : address.balance && 'NO' || ''}</UniformListColumn>
        <UniformListColumn>{address.address}</UniformListColumn>
      </UniformListRow>
    )
  }

	render() {
		return (
      <UniformList
        items={this.props.items}
        headerRenderer={address => this.getListHeaderRenderer(address)}
        rowRenderer={address => this.getListRowRenderer(address)}
      />
		)
	}
}
