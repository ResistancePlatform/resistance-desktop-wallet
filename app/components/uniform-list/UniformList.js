// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'

import styles from './UniformList.scss'
import VLayout from '~/theme/v-box-layout.scss'

type Props = {
  className?: string,
  emptyMessage?: string,
  sortKeys?: string[],
  +items: object[],
  +headerRenderer: item => void,
  +rowRenderer: item => void
}

class UniformList extends Component<Props> {
	props: Props
  header: any
  headerWidths: string[]

	/**
	 * @memberof UniformList
	 */
  constructor(props) {
    super(props)

    this.header = this.props.headerRenderer()
    this.headerWidths = []

    this.header.props.children.forEach(child => {
      this.headerWidths.push(child.props.width || 'auto')
    })
  }

	/**
	 * @memberof UniformList
	 */
  getHeader() {
    return React.cloneElement(this.header, {
      className: classNames(styles.header, this.header.props.className),
      header: true
    })
  }

	/**
	 * @memberof UniformList
	 */
  applyColumnWidths(rowChild) {
    let index = -1

    const children = rowChild.props.children.map((child) => {
      if (child.type && child.type.displayName === 'UniformListColumn') {
        index += 1
        return React.cloneElement(child, { width: this.headerWidths[index] })
      }
      return child
    })

    return React.cloneElement(rowChild, { children })
  }

	/**
	 * @memberof UniformList
	 */
  getSortedItems() {
    if (!this.props.sortKeys || !this.props.sortKeys.length) {
      return this.props.items
    }

    const key = this.props.sortKeys[0]

    // TODO: implement properly #134
    const sortedItems = this.props.items.slice(0).sort(
      (record1, record2) => record1[key].toString().localeCompare(record2[key].toString())
    )

    return sortedItems
  }


	/**
	 * @memberof UniformList
	 */
  render() {
    return (
      <div className={classNames(styles.container, VLayout.vBoxChild, this.props.className)}>

        {this.props.items.length > 0 && this.getHeader()}

        {this.props.items.length
          ? this.getSortedItems().map(item => this.applyColumnWidths(this.props.rowRenderer(item)))
          : this.props.emptyMessage || `No data to display.`
        }
      </div>
    )
  }

}

export default connect(null, null)(UniformList)