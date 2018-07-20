// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux';
import { SystemInfoActions, SystemInfoState } from '../../state/reducers/system-info/system-info.reducer'
import { appStore } from '../../state/store/configureStore'
import { AppState } from '../../state/reducers/appState'

import styles from './system-info.scss'
import HLayout from '../../theme/h-box-layout.scss'

console.log(`appStore from system-info.js: `, appStore)

type Props = {
	systemInfo: SystemInfoState
}

/**
 * @class SystemInfo
 * @extends {Component<Props>}
 */
class SystemInfo extends Component<Props> {
	props: Props

	/**
	 * @memberof SystemInfo
	 */
	componentDidMount() {
		appStore.dispatch(SystemInfoActions.startGettingDaemonInfo())
		appStore.dispatch(SystemInfoActions.startGettingBlockChainInfo())
	}

	displayLastBlockTime(tempDate: Date | null) {
		if (tempDate === undefined || tempDate === null || tempDate === false) {
			return 'N/A'
		}

		const nowDate = new Date()
		let tempDateTimeStr = ''
		if (tempDate.toLocaleDateString() === nowDate.toLocaleDateString()) {
			tempDateTimeStr = `Today, ${tempDate.toLocaleTimeString()}`
		} else {
			tempDateTimeStr = tempDate.toLocaleString()
		}

		return tempDateTimeStr.substring(0, tempDateTimeStr.length - 3)
	}

	/**
	 * @returns
	 * @memberof SystemInfo
	 */
	render() {
		return (
			<div className={[styles.systemInfoContainer, HLayout.hBoxContainer].join(' ')}>
				{ /* Status column container */}
				<div className={[styles.statusContainer, HLayout.hBoxChild].join(' ')}>

					{ /* Resistance status coloumn */}
					<div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>RESISTANCE STATUS</div>
						<div className={styles.statusColoumnValue}>
							{this.props.systemInfo.daemonInfo.status === 'RUNNING' ?
								<span><i className={['fa', 'fa-check-circle', styles.daemonIsRunning].join(' ')} /><span>Running</span></span> :
								<span><i className={['fa', 'fa-times-circle', styles.daemonIsNotRunning].join(' ')} /><span>NOT RUNNING</span></span>
							}
						</div>
					</div>

					{ /* Resistance status coloumn */}
					<div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>SYNCHRONIZED</div>
						<div className={styles.statusColoumnValue}>{this.props.systemInfo.blockChainInfo.blockchainSynchronizedPercentage}%</div>
					</div>

					{ /* Resistance status coloumn */}
					<div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>UP TO</div>
						<div className={styles.statusColoumnValue}>{this.displayLastBlockTime(this.props.systemInfo.blockChainInfo.lastBlockDate)}</div>
					</div>

					{ /* Resistance status coloumn */}
					{/* <div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>RESIDENT</div>
						<div className={styles.statusColoumnValue}>{this.props.resident}</div>
					</div> */}

					{ /* Resistance status coloumn */}
					<div className={styles.statusColumnWrapper}>
						<div className={styles.statusColoumnTitle}>CONNECTIONS</div>
						<div className={styles.statusColoumnValue}>{this.props.systemInfo.blockChainInfo.connectionCount}</div>
					</div>

				</div>

				{ /* Buttons */}
				<button className={[styles.walletInFinderButton].join(' ')}>WALLET IN FINDER</button>
				<button className={[styles.installationPathButton].join(' ')}>INSTALLATION PATH</button>
			</div>
		)
	}
}


const mapStateToProps = (state: AppState) => ({
	systemInfo: state.systemInfo
})

export default connect(mapStateToProps, null)(SystemInfo);
