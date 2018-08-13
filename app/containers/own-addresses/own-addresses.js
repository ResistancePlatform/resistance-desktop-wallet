// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { OwnAddressesActions, OwnAddressesState } from '../../state/reducers/own-addresses/own-addresses.reducer'
import { appStore } from '../../state/store/configureStore'
import OwnAddressList from '../../components/own-addresses/own-address-list'
import AddAddressPopupMenu from '../../components/own-addresses/add-address-popup-menu'
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
		appStore.dispatch(OwnAddressesActions.startGettingOwnAddresses())
	}

	/**
	 * @memberof OwnAddresses
	 */
	componentWillUnmount() {
		appStore.dispatch(OwnAddressesActions.stopGettingOwnAddresses())
	}

	eventConfirm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

	commonMenuItemEventHandler(event) {
		this.eventConfirm(event)
		appStore.dispatch(OwnAddressesActions.updateDropdownMenuVisibility(false))
	}

	onShowPrivteKeyClicked(event) {
		this.eventConfirm(event)
	}

	onAddNewAddressClicked(event) {
		this.eventConfirm(event)
		appStore.dispatch(OwnAddressesActions.updateDropdownMenuVisibility(true))
	}

	hideDropdownMenu(event) {
		this.commonMenuItemEventHandler(event)
	}

	getDropdownMenuStyles() {
		return this.props.ownAddresses && this.props.ownAddresses.showDropdownMenu ? 'block' : 'none'
	}

	onAddNewTransparentAddressHandler(event) {
		this.commonMenuItemEventHandler(event)
		appStore.dispatch(OwnAddressesActions.createNewAddress(false))
	}

	onAddNewPrivateAddressHandler(event) {
		this.commonMenuItemEventHandler(event)
		appStore.dispatch(OwnAddressesActions.createNewAddress(true))
	}

	onImportPrivateKeyHandler(event) {
		this.commonMenuItemEventHandler(event)
	}

	onExportPrivateKeysHandler(event) {
		this.commonMenuItemEventHandler(event)
	}

	/**
	 * @returns
	 * @memberof OwnAddresses
	 */
	render() {
		return (
			// Layout container
			<div
				className={[styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}
				onClick={(event) => this.hideDropdownMenu(event)}
				onKeyDown={(event) => this.hideDropdownMenu(event)}
			>

				{ /* Route content */}
				<div className={[styles.ownAddressesContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>

					<div className={[HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}>

						{ /* Top bar */}
						<div className={[styles.topBar, HLayout.hBoxContainer].join(' ')}>
							<div className={styles.topBarTitle}>Own Addresses</div>
							<div className={[styles.topBarButtonContainer, HLayout.hBoxChild].join(' ')}>
								<button onClick={(event) => this.onShowPrivteKeyClicked(event)} onKeyDown={(event) => this.onShowPrivteKeyClicked(event)} > SHOW PRIVATE KEY</button>
								<div className={[styles.addAddressButtonContainer].join(' ')} onClick={(event) => this.onAddNewAddressClicked(event)} onKeyDown={(event) => this.onAddNewAddressClicked(event)} >
									<button className={styles.addNewAddressButton} >+ ADD NEW ADDRESS
										<span className="icon-arrow-down" />
									</button>

									{ /* Dropdown menu container */}
									<div className={styles.dropdownMenu} style={{ display: this.getDropdownMenuStyles() }}>
										<AddAddressPopupMenu
											onAddNewTransparentAddressHandler={(event) => this.onAddNewTransparentAddressHandler(event)}
											onAddNewPrivateAddressHandler={(event) => this.onAddNewPrivateAddressHandler(event)}
											onImportPrivateKeyHandler={(event) => this.onImportPrivateKeyHandler(event)}
											onExportPrivateKeysHandler={(event) => this.onExportPrivateKeysHandler(event)}
										/>
									</div>
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

export default connect(mapStateToProps, null)(OwnAddresses)
