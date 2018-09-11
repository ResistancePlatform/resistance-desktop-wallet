// @flow
import moment from 'moment'
import React, { Component } from 'react'

import { truncateAmount } from '~/constants'
import { UniformList, UniformListHeader, UniformListRow, UniformListColumn} from '~/components/uniform-list'
import { Transaction } from '~/state/reducers/overview/overview.reducer'

const transactionDirectionMap = {
  receive: `In`,
  send: `Out`,
  generate: `Mined`,
  immature: `Immature`
}

type Props = {
	items: Transaction[],
	onRowClick: () => void,
	onRowContextMenu: (event: SyntheticEvent<any>, transactionId: string) => void
}

export default class TransactionList extends Component<Props> {
	props: Props

  getListHeaderRenderer() {
    return (
      <UniformListHeader>
        <UniformListColumn width="6rem">Type</UniformListColumn>
        <UniformListColumn width="5rem">Direction</UniformListColumn>
        <UniformListColumn width="5rem">Confirmed</UniformListColumn>
        <UniformListColumn width="6rem">Amount</UniformListColumn>
        <UniformListColumn width="9rem">Date</UniformListColumn>
        <UniformListColumn>Destination address</UniformListColumn>
      </UniformListHeader>
    )
  }

  getListRowRenderer(transaction: Transaction) {
    return (
      <UniformListRow
        key={transaction.transactionId}
        onClick={e => this.props.onRowClick(e)}
        onContextMenu={e => this.props.onRowContextMenu(e, transaction.transactionId)}
      >
        <UniformListColumn>{transaction.type}</UniformListColumn>
        <UniformListColumn>{transactionDirectionMap[transaction.category] || transaction.category}</UniformListColumn>
        <UniformListColumn>{transaction.confirmations !== 0 ? 'Yes' : 'No'}</UniformListColumn>
        <UniformListColumn>{truncateAmount(transaction.amount)}</UniformListColumn>
        <UniformListColumn>{moment.unix(transaction.timestamp).format('L kk:mm:ss')}</UniformListColumn>
        <UniformListColumn>{transaction.destinationAddress}</UniformListColumn>
      </UniformListRow>
    )
  }

	render() {
		return (
      <UniformList
        items={this.props.items}
        headerRenderer={transaction => this.getListHeaderRenderer(transaction)}
        rowRenderer={transaction => this.getListRowRenderer(transaction)}
        emptyMessage="No transactions to display."
      />
		)
	}
}
