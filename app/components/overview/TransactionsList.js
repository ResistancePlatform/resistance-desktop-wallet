// @flow
import moment from 'moment'
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import cn from 'classnames'

import { truncateAmount } from '~/utils/decimal'
import { Address } from '~/components/address/Address'
import { MoreButton } from '~/components/rounded-form'
import { UniformList, UniformListHeader, UniformListRow, UniformListColumn} from '~/components/uniform-list'
import { Transaction } from '~/reducers/overview/overview.reducer'

import styles from './TransactionsList.scss'

const transactionDirectionMap = t => ({
  receive: t(`In`),
  send: t(`Out`),
  generate: t(`Mined`),
  immature: t(`Immature`)
})

type Props = {
  t: any,
  i18n: any,
	items: Transaction[],
	onRowClick: () => void,
	onRowContextMenu: (event: SyntheticEvent<any>, transactionId: string) => void
}

class TransactionsList extends Component<Props> {
	props: Props

  getListHeaderRenderer() {
    const { t } = this.props

    return (
      <UniformListHeader>
        <UniformListColumn width="4rem">{t(`Type`)}</UniformListColumn>
        <UniformListColumn width="5rem">{t(`Direction`)}</UniformListColumn>
        <UniformListColumn width="4rem">{t(`Confirmed`)}</UniformListColumn>
        <UniformListColumn width="5rem">{t(`Amount`)}</UniformListColumn>
        <UniformListColumn width="6.6rem">{t(`Date`)}</UniformListColumn>
        <UniformListColumn>{t(`Destination address`)}</UniformListColumn>
      </UniformListHeader>
    )
  }

  getListRowRenderer(transaction: Transaction) {
    const { t, i18n } = this.props

    return (
      <UniformListRow
        className={styles.row}
        onClick={e => this.props.onRowClick(e, transaction.transactionId)}
        onContextMenu={e => this.props.onRowContextMenu(e, transaction.transactionId)}
      >
        <UniformListColumn>{transaction.type}</UniformListColumn>
        <UniformListColumn className={styles.categoryColumn}>
          <div className={cn('icon', styles.categoryIcon, styles[transaction.category])} />
          {transactionDirectionMap(t)[transaction.category] || transaction.category}
        </UniformListColumn>
        <UniformListColumn>{transaction.confirmations !== 0 ? t('Yes') : t('No')}</UniformListColumn>
        <UniformListColumn>
          {truncateAmount(transaction.amount)}
        </UniformListColumn>
        <UniformListColumn className={styles.dateColumn}>{moment.unix(transaction.timestamp).locale(i18n.language).format('L kk:mm:ss')}</UniformListColumn>
        <UniformListColumn>
          <Address className={styles.address} value={transaction.destinationAddress} />

          <MoreButton
            className={styles.moreButton}
            onClick={e => this.props.onRowContextMenu(e, transaction.transactionId)}
          />
        </UniformListColumn>
      </UniformListRow>
    )
  }

	render() {
    const { t } = this.props

		return (
      <UniformList
        items={this.props.items}
        headerRenderer={transaction => this.getListHeaderRenderer(transaction)}
        rowRenderer={transaction => this.getListRowRenderer(transaction)}
        emptyMessage={t(`You have no transactions yet`)}
      />
		)
	}
}

export default translate('overview')(TransactionsList)
