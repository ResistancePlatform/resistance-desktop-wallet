// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux';
import { OverviewActions, OverviewState } from '../state/reducers/overview/overview.reducer'
import { appStore } from '../state/store/configureStore'
// import { AppState } from '../state/reducers/appState'

import NaviBar from '../components/Navi-bar'
import Balance from '../components/overview/Balance'
import TransactionList from '../components/overview/TransactionList'
import styles from './OverviewPage.scss'
import HLayout from '../theme/h-box-layout.scss'
import VLayout from '../theme/v-box-layout.scss'


type Props = {
  overview: OverviewState
}

class Overview extends Component<Props> {
  props: Props

  componentDidMount() {
    appStore.dispatch(OverviewActions.loadBalances())
    // appStore.dispatch(OverviewActions.loadTransactionList())
  }

  render() {
    return (
      <div className={[styles.overviewContainer, HLayout.hBoxContainer].join(' ')}>
        <NaviBar />

        <div className={[HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}>
          <Balance balances={this.props.overview.balances} />
          <TransactionList />
        </div>
      </div>
    )
  }
}


const mapStateToProps = (state) => ({
  overview: state.overview
})

export default connect(mapStateToProps, null)(Overview);
