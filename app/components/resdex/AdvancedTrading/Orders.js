
// @flow
import moment from 'moment'
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cn from 'classnames'

import { toDecimalPlaces } from '~/utils/decimal'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import {
  UniformList,
  UniformListHeader,
  UniformListRow,
  UniformListColumn
} from '~/components/uniform-list'
import { ResDexState, ResDexActions  } from '~/reducers/resdex/resdex.reducer'
import { getOrdersBreakdown, getOrderStatusName } from '~/utils/resdex'
import { ResDexOrdersActions } from '~/reducers/resdex/orders/reducer'

import styles from './Orders.scss'
import scrollStyles from '~/assets/styles/scrollbar.scss'

type Props = {
  i18n: any,
  t: any,
  actions: object,
  resDex: ResDexState,
  className?: string
}

/**
 * @class Orders
 * @extends {Component<Props>}
 */
class Orders extends Component<Props> {
	props: Props

	/**
   * @memberof Orders
	 */
  getListHeaderRenderer() {
    const { t } = this.props

    return (
      <UniformListHeader>
        <UniformListColumn width="17%">{t(`Time`)}</UniformListColumn>
        <UniformListColumn width="11%">{t(`Pair`)}</UniformListColumn>
        <UniformListColumn width="9%">{t(`Type`)}</UniformListColumn>
        <UniformListColumn width="18%">{t(`Amount out`)}</UniformListColumn>
        <UniformListColumn width="18%">{t(`Amount in`)}</UniformListColumn>
        <UniformListColumn width="11%">{t(`Private`)}</UniformListColumn>
        <UniformListColumn width="16%">{t(`Status`)}</UniformListColumn>
      </UniformListHeader>
    )
  }

	/** @memberof ResDexOrders
	 */
  getListRowRenderer(order) {
    const { i18n, t } = this.props

    const quoteLabel = `${toDecimalPlaces(order.quoteCurrencyAmount)} ${order.quoteCurrency}`
    const baseLabel = `${toDecimalPlaces(order.baseCurrencyAmount)} ${order.baseCurrency}`

    return (
      <UniformListRow
        className={styles.row}
        key={order.uuid}
        onClick={() => order.isSwap ? this.props.actions.showOrderModal(order.uuid) : false}
      >
        <UniformListColumn className={styles.time}>
          {moment(order.timeStarted).locale(i18n.language).format('kk:mm L')}
        </UniformListColumn>
        <UniformListColumn>
          {order.isMarket ? order.baseCurrency : order.quoteCurrency}/{order.isMarket ? order.quoteCurrency : order.baseCurrency}
        </UniformListColumn>
        <UniformListColumn>
          {order.isMarket ? t(`Market`) : t(`Limit`)}
        </UniformListColumn>
        <UniformListColumn className={cn(styles.amount, styles.lesser)}>
          -{order.isMarket ? quoteLabel : baseLabel}
        </UniformListColumn>
        <UniformListColumn className={cn(styles.amount, styles.greater)}>
          {order.isMarket ? baseLabel : quoteLabel}
        </UniformListColumn>
        <UniformListColumn>
          <i className={cn('icon', styles.private, { [styles.enabled]: order.isPrivate })} />
        </UniformListColumn>
        <UniformListColumn>
          <span className={cn(styles.status, styles[order.isPrivate ? order.privacy.status : order.status])}>
            {getOrderStatusName(order)}
          </span>
        </UniformListColumn>
      </UniformListRow>
    )
  }

	render() {
    const { t } = this.props

    const { swapHistory } = this.props.resDex.orders

    const {
      openOrders,
      openSwaps,
      completedSwaps
    } = getOrdersBreakdown(swapHistory)

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

          <TabPanel className={cn(styles.tabPanel, scrollStyles.scrollbar, scrollStyles.resdex)}>
            <UniformList
              className={styles.list}
              items={openOrders}
              headerRenderer={() => this.getListHeaderRenderer()}
              rowRenderer={openOrder => this.getListRowRenderer(openOrder)}
              emptyMessage={false}
            />
          </TabPanel>

          <TabPanel className={cn(styles.tabPanel, scrollStyles.scrollbar, scrollStyles.resdex)}>
            <UniformList
              className={styles.list}
              items={openSwaps}
              headerRenderer={() => this.getListHeaderRenderer()}
              rowRenderer={openSwap => this.getListRowRenderer(openSwap)}
              emptyMessage={false}
            />
          </TabPanel>


          <TabPanel className={cn(styles.tabPanel, scrollStyles.scrollbar, scrollStyles.resdex)}>
            <UniformList
              className={styles.list}
              items={completedSwaps}
              headerRenderer={() => this.getListHeaderRenderer()}
              rowRenderer={completedOrder => this.getListRowRenderer(completedOrder)}
              emptyMessage={false}
            />
          </TabPanel>

        </Tabs>
      </div>
    )
  }
}

const mapStateToProps = state => ({
	resDex: state.resDex,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexOrdersActions, dispatch),
  resDexActions: bindActionCreators(ResDexActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(Orders))
