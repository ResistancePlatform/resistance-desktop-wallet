// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux';
import { SendCashActions, SendCashState } from '../../state/reducers/send-cash/send-cash.reducer'
import { appStore } from '../../state/store/configureStore'
import styles from './send-cash.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'


type Props = {
	sendCash: SendCashState
}

/**
 * @class SendCash
 * @extends {Component<Props>}
 */
class SendCash extends Component<Props> {
	props: Props

	/**
	 * @memberof SendCash
	 */
	componentDidMount() {
	}

	/**
	 * @memberof SendCash
	 */
	componentWillUnmount() {
	}

	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

	getPrivatelyToggleButtonClasses() {
		return this.props.sendCash.isPrivateSendOn ? `${styles.toggleButton} ${styles.toggleButtonOn}` : `${styles.toggleButton}`
	}

	getPrivatelyToggleButtonText() {
		return this.props.sendCash.isPrivateSendOn ? `ON` : `OFF`
	}

	onPrivateSendToggleClicked(event) {
		this.eventConfirm(event)
		appStore.dispatch(SendCashActions.togglePrivateSend())
	}

	/**
	 * @returns
	 * @memberof SendCash
	 */
	render() {
		return (
			// Layout container
			<div className={[styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}>

				{ /* Route content */}
				<div className={[styles.sendCashContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>

					<div className={[HLayout.hBoxChild, VLayout.vBoxContainer, styles.wrapperContainer].join(' ')}>

						{ /* Title bar */}
						<div className={styles.titleBar}>Send Cash</div>

						{ /* Send from */}
						<div className={styles.sendFromContainer}>
							<div className={styles.sendFromTitle}>SEND FROM</div>

							<div className={styles.sendFromCheckboxContainer}>
								<span><input type="radio" name="sendFromType" checked />Transparent address</span>
								<span><input type="radio" name="sendFromType" />Private address</span>
							</div>
						</div>

						{ /* From address */}
						<div className={styles.fromAddressContainer}>
							<div className={styles.leftPart}>
								<div className={styles.fromAddressTitle}>FROM ADDRESS</div>

								<div className={styles.fromAddressInput}>
									<input type="text" />
									<span className={styles.fromAddressInputAddon}><i className="fa fa-chevron-down" /></span>
								</div>
							</div>

							{ /* Toggle button */}
							<div className={styles.sendPrivatelyToggleContainer}>
								<div className={styles.sendPrivateTitle}>SEND PRIVATELY</div>

								<div 
									className={this.getPrivatelyToggleButtonClasses()} 
									onClick={(event) => this.onPrivateSendToggleClicked(event)}
									onKeyDown={(event) => this.onPrivateSendToggleClicked(event)}
								>
									<div className={styles.toggleButtonSwitcher} />
									<div className={styles.toggleButtonText} >{this.getPrivatelyToggleButtonText()}</div>
								</div>
							</div>
						</div>

					</div>
				</div>

			</div>
		)
	}
}


const mapStateToProps = (state) => ({
	sendCash: state.sendCash
})

export default connect(mapStateToProps, null)(SendCash);
