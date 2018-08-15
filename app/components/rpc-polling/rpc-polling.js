// @flow
/* eslint-disable react/prop-types */

import React, { Component } from 'react'
import { connect } from 'react-redux'

import { appStore } from '../../state/store/configureStore'
import { SettingsState } from '../../state/reducers/settings/settings.reducer'

const responseActionTimeout = 10.0

type ActionKind = 'polling' | 'success' | 'failure'

type Props = {
  interval: float,
  actions: { [ActionKind]: func },
  onError?: func,
	settings: SettingsState
}

type State = {
  isResponseActionReceived: boolean
}

class RpcPolling extends Component<Props> {
	props: Props
  state: State

  isActionQueued: boolean
  intervalId: number

	/**
	 * @memberof StatusModal
	 */
  constructor(props) {
    super(props)

    this.state = {
      isResponseActionReceived: false
    }

    this.isActionQueued = false
    this.intervalId = -1
  }

	/**
	 * @memberof RpcPolling
	 */
	componentDidMount() {
    this.start()
	}

	/**
	 * @param {*} prevProps
	 * @memberof RpcPolling
	 */
  componentDidUpdate(prevProps) {
    const isNodeStatusChanged = prevProps.settings.childProcessesStatus.NODE !== this.props.settings.childProcessesStatus.NODE

    if (isNodeStatusChanged && this.isActionQueued) {
      this.dispatchActionIfNodeReady()
    }
  }

	/**
	 * @memberof RpcPolling
	 */
	componentWillUnmount() {
		if (this.intervalId !== -1) {
			clearInterval(this.intervalId)
      this.intervalId = -1
		}
	}

	/**
	 * @memberof RpcPolling
	 */
  start() {
    this.isActionQueued = false
    this.dispatchActionIfNodeReady()
    this.intervalId = setInterval(
      () => { this.dispatchActionIfNodeReady() },
        this.props.interval * 1000
    )
  }

  dispatchActionIfNodeReady() {
    if (this.props.settings.childProcessesStatus.NODE === 'RUNNING') {
      this.isActionQueued = false
      appStore.dispatch(this.props.actions.polling())
    } else {
      this.isActionQueued = true
      this.props.onError ? this.props.onError(this.props.actions.polling) : null
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
