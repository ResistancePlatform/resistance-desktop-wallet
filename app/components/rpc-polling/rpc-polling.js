// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { SettingsState } from '../../state/reducers/settings/settings.reducer'

type Props = {
	settings: SettingsState
}

class RpcPolling extends Component<Props> {
	props: Props
  isPollingActive: boolean

	/**
	 * @memberof RpcPolling
	 */
	componentDidMount() {
    this.isPollingActive = false
    this.checkLocalNodeStatusAndStartPolling()
	}

	/**
	 * @param {*} nextProps
	 * @memberof RpcPolling
	 */
  componentDidUpdate() {
    this.checkLocalNodeStatusAndStartPolling()
  }

	/**
	 * @memberof RpcPolling
	 */
	componentWillUnmount() {
    this.isPollingActive = false
	}

	/**
	 * @memberof RpcPolling
	 */
  checkLocalNodeStatusAndStartPolling() {
    if (!this.isPollingActive && this.props.settings.childProcessesStatus.NODE === 'RUNNING') {
      this.isPollingActive = true
    }
  }

	/**
	 * @returns
	 * @memberof RpcPolling
	 */
	render() {
    return (
      <div />
    )
  }
}

const mapStateToProps = state => ({
	settings: state.settings
})

export default connect(mapStateToProps, null)(RpcPolling)
