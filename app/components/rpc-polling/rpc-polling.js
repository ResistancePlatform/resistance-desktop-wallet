// @flow
/* eslint-disable react/prop-types */

import React, { Component } from 'react'
import { connect } from 'react-redux'

import { appStore } from '~/state/store/configureStore'
import { SettingsState } from '~/state/reducers/settings/settings.reducer'
import { RpcPollingActions, RpcPollingState } from '~/state/reducers/rpc-polling/rpc-polling.reducer'

type ActionKind = 'polling' | 'success' | 'failure'

type Props = {
  interval: float,
  actions: { [ActionKind]: func },
  onError?: func,
	settings: SettingsState,
  rpcPolling: RpcPollingState
}

class RpcPolling extends Component<Props> {
	props: Props

  isActive: boolean
  isActionQueued: boolean
  intervalId: number

	/**
	 * @memberof StatusModal
	 */
  constructor(props) {
    super(props)
    this.intervalId = -1
    this.isActionQueued = false
  }

	/**
	 * @memberof RpcPolling
	 */
	componentDidMount() {
    const { actions } = this.props
    this.isActive = false
    appStore.dispatch(RpcPollingActions.registerActions(
      actions.polling.toString(), actions.success.toString(), actions.failure.toString()
    ))
    this.start()
	}

	/**
	 * @param {*} prevProps
	 * @memberof RpcPolling
	 */
  componentDidUpdate() {
    const isNodeRunning = this.props.settings.childProcessesStatus.NODE === 'RUNNING'

    /**
     * Resend mechanism: If already got queued action and `NODE` status is `RUNNING`, then resend the polling action immediate
     */
    if (isNodeRunning && this.isActionQueued) {
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
    appStore.dispatch(RpcPollingActions.unregisterActions(this.props.actions.polling.toString()))
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
    const pollingActionType = this.props.actions.polling.toString()

    // Make sure a response to the previously dispatched action has been received
    // TODO: Add response timeout, like 30s
    if (this.isActive && !this.props.rpcPolling.actionsResponseReceived[pollingActionType]) {
      console.log(`Polling action ${pollingActionType} takes longer than expected, waiting...`)
      return
    }

    if (this.props.settings.childProcessesStatus.NODE === 'RUNNING') {
      this.isActionQueued = false
      this.isActive = true
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
	settings: state.settings,
  rpcPolling: state.rpcPolling
})

export default connect(mapStateToProps, null)(RpcPolling)
