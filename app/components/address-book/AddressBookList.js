// @flow
import React, { Component } from 'react'
import { AddressBookRecord } from '~/state/reducers/address-book/address-book.reducer'

import { UniformList, UniformListHeader, UniformListRow, UniformListColumn} from '~/components/uniform-list'

type Props = {
	items: AddressBookRecord[],
	onRowClick?: () => void,
	onRowContextMenu: (event: SyntheticEvent<any>, transactionId: string) => void
}

/**
 * @export
 * @class AddressBookList
 * @extends {Component<Props>}
 */
export default class AddressBookList extends Component<Props> {
	props: Props

  getListHeaderRenderer() {
    return(
      <UniformListHeader>
        <UniformListColumn width="10rem">Name</UniformListColumn>
        <UniformListColumn>Address</UniformListColumn>
      </UniformListHeader>
    )
  }

  getListRowRenderer(record: AddressBookRecord) {
    return (
      <UniformListRow
        key={record.address}
        onClick={e => this.props.onRowClick(e)}
        onContextMenu={e => this.props.onRowContextMenu(e, record)}
      >
        <UniformListColumn>{record.name}</UniformListColumn>
        <UniformListColumn>{record.address}</UniformListColumn>
      </UniformListRow>
    )
  }

	/**
	 * @returns
	 * @memberof AddressBookList
	 */
	render() {
		return (
      <UniformList
        items={this.props.items}
        sortKeys={['name']}
        headerRenderer={() => this.getListHeaderRenderer()}
        rowRenderer={record => this.getListRowRenderer(record)}
        emptyMessage="You don't have any address records yet."
      />
		)
	}
}
