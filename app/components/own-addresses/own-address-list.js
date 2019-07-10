// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { truncateAmount } from '~/utils/decimal'
import { CopyButton } from '~/components/rounded-form'
import { UniformList, UniformListHeader, UniformListRow, UniformListColumn} from '~/components/uniform-list'
import { Address } from '~/components/address/Address'
import { AddressRow } from '~/reducers/own-addresses/own-addresses.reducer'

import styles from './own-address-list.scss'

type Props = {
  t: any,
	items: AddressRow[],
	onRowClick: (event: any, address: string) => void
}

class OwnAddressList extends Component<Props> {
	props: Props

  getListHeaderRenderer(t) {
    return (
      <UniformListHeader>
        <UniformListColumn width="6.875rem">{t(`Balance`)}</UniformListColumn>
        <UniformListColumn width="7.25rem">{t(`Confirmed`)}</UniformListColumn>
        <UniformListColumn>{t(`Address`)}</UniformListColumn>
      </UniformListHeader>
    )
  }

  getListRowRenderer(t, address: AddressRow) {
    const { balance } = address
    const displayBalance = balance === null ? t('N/A') : truncateAmount(balance)

    return (
      <UniformListRow
        key={address.address}
        className={styles.row}
        onContextMenu={e => this.props.onRowClick(e, address.address)}
      >
        <UniformListColumn>{displayBalance}</UniformListColumn>

        <UniformListColumn>
          {address.confirmed
            ? t('Yes')
            : address.balance && t('No') || ''
          }
        </UniformListColumn>

        <UniformListColumn className={styles.addressColumn}>
          {address.address.startsWith('z') &&
            <div className={cn('icon', styles.privacyIcon)} />
          }

          {address.isLedger &&
            <div className={styles.ledgerIcon} />
          }

          <Address className={styles.address} value={address.address} />

          <CopyButton className={styles.copyButton} valueToCopy={address.address} />

        </UniformListColumn>

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
