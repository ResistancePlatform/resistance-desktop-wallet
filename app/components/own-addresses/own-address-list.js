// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'

import { truncateAmount } from '~/constants'
import { UniformList, UniformListHeader, UniformListRow, UniformListColumn} from '~/components/uniform-list'
import { AddressRow } from '~/reducers/own-addresses/own-addresses.reducer'

import styles from './own-address-list.scss'

type Props = {
  t: any,
	items: AddressRow[],
  frozenAddresses: { [string]: Decimal },
	onRowClick: (event: any, address: string) => void
}

class OwnAddressList extends Component<Props> {
	props: Props

  getListHeaderRenderer(t) {
    return (
      <UniformListHeader>
        <UniformListColumn width="22%">{t(`Balance`)}</UniformListColumn>
        <UniformListColumn width="18%">{t(`Confirmed`)}</UniformListColumn>
        <UniformListColumn width="60%">{t(`Address`)}</UniformListColumn>
      </UniformListHeader>
    )
  }

  getListRowRenderer(t, address: AddressRow) {
    const frozenBalance = this.props.frozenAddresses[address.address]
    const balance = frozenBalance === undefined ? address.balance : frozenBalance
    const displayBalance = balance === null ? t('ERROR') : truncateAmount(balance)

    return (
      <UniformListRow
        key={address.address}
        className={frozenBalance ? styles.mergingContainer : ''}
        onContextMenu={e => this.props.onRowClick(e, address.address)}
      >
        {Boolean(frozenBalance) &&
          <div className={styles.merging}><span>{t(`merging`)}</span></div>
        }
        <UniformListColumn>{displayBalance}</UniformListColumn>
        <UniformListColumn>{address.confirmed ? t('Yes') : address.balance && t('No') || ''}</UniformListColumn>
        <UniformListColumn>{address.address}</UniformListColumn>
      </UniformListRow>
    )
  }

	render() {
    const { t } = this.props

		return (
      <UniformList
        items={this.props.items}
        headerRenderer={() => this.getListHeaderRenderer(t)}
        rowRenderer={address => this.getListRowRenderer(t, address)}
      />
		)
	}
}

export default translate('own-addresses')(OwnAddressList)
