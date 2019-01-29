// @flow
import React, { Component} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import { OwnAddressesActions } from '~/reducers/own-addresses/own-addresses.reducer'

type Props = {
  t: any,
  interval: float,
  timer: int,
}

/**
 * @class ConnectLedgerModal
 * @extends {Component<Props>}
 */
class LedgerPolling extends Component<Props> {
  props: Props

  state = {
    timer: null,
    interval: 2000
  }

  constructor(props) {
    super(props)
  }

  componentDidMount(){
    //if(!this.props.connectLedgerModal.isLedgerResistanceAppOpen){
      let timer = setInterval(() => {this.tick(this)}, 2000)
      this.setState({timer})
    //}
    //console.log(getStore())
  }

  componentWillUnmount() {
    clearInterval(this.state.timer)
  }

  tick() {
    var attemptLedgerConnect = !this.props.connectLedgerModal.isLedgerResistanceAppOpen && !this.props.connectLedgerModal.isTransactionPending
    if(this.props.connectLedgerModal.pollForLedger){
      this.props.actions.getLedgerConnected()
    } else {
      //clearInterval(this.state.timer)
    }
  }

  render() {
    return (
      <div />
    )
  }
}

const mapStateToProps = (state) => ({
  connectLedgerModal: state.ownAddresses.connectLedgerModal
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(OwnAddressesActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('own-addresses')(LedgerPolling))