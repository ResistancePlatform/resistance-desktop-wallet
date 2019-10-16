
// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'
import cn from 'classnames'
import log from 'electron-log'

import { toDecimalPlaces, toMaxDigits } from '~/utils/decimal'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import {
  UniformList,
  UniformListHeader,
  UniformListRow,
  UniformListColumn
} from '~/components/uniform-list'
import { ResDexState } from '~/reducers/resdex/resdex.reducer'

import styles from './Orders.scss'

type Props = {
  t: any,
  resDex: ResDexState,
  className?: string,
}

/**
 * @class Orders
 * @extends {Component<Props>}
 */
class Orders extends Component<Props> {
	props: Props

	render() {
    const { t } = this.props

    return (
      <div className={cn(styles.orders, this.props.className)}>
        <Tabs
          className={styles.tabs}
          selectedTabClassName={styles.selectedTab}
          selectedTabPanelClassName={styles.selectedMainTabPanel}
        >
          <TabList className={styles.tabList}>
            <Tab className={styles.tab}>{t(`Open Orders`)}</Tab>
            <Tab className={styles.tab}>{t(`Swaps`)}</Tab>
            <Tab className={styles.tab}>{t(`Swap History`)}</Tab>
          </TabList>
        </Tabs>
      </div>
    )
  }
}

const mapStateToProps = state => ({
	resDex: state.resDex,
})

export default connect(mapStateToProps, null)(translate('resdex')(Orders))
