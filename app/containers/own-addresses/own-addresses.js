// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux';
import { OwnAddressesActions, OwnAddressesState } from '../../state/reducers/own-addresses/own-addresses.reducer'
import { appStore } from '../../state/store/configureStore'
import OwnAddressList from '../../components/own-addresses/own-address-list'
import styles from './own-addresses.scss'
import HLayout from '../../theme/h-box-layout.scss'
import VLayout from '../../theme/v-box-layout.scss'


type Props = {
	ownAddresses: OwnAddressesState
}

/**
 * @class OwnAddresses
 * @extends {Component<Props>}
 */
class OwnAddresses extends Component<Props> {
	props: Props

	/**
	 * @memberof OwnAddresses
	 */
	componentDidMount() {
		appStore.dispatch(OwnAddressesActions.getOwnAddresses())
	}

	/**
	 * @returns
	 * @memberof OwnAddresses
	 */
	render() {
		return (
			// Layout container
			<div className={[styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}>

				{ /* Route content */}
				<div className={[styles.ownAddressesContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>

					<div className={[HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}>

						{ /* Top bar */}
						<div className={[styles.topBar, HLayout.hBoxContainer].join(' ')}>
							<div className={styles.topBarTitle}>Own Addresses</div>
							<div className={[styles.topBarButtonContainer, HLayout.hBoxChild].join(' ')}>
								<button >SHOW PRIVATE KEY</button>
								<button >REFRESH</button>
								<div>
									<button className={styles.addNewAddressButton} >+ ADD NEW ADDRESS</button>
									<div className={styles.addNewAddressButtonAddon} ><i className="fa fa-chevron-down" /></div>
								</div>
							</div>
						</div>

						<OwnAddressList addresses={this.props.ownAddresses.addresses} />

					</div>
				</div>

			</div>
		)
	}
}


const mapStateToProps = (state) => ({
	ownAddresses: state.ownAddresses
})

export default connect(mapStateToProps, null)(OwnAddresses);
