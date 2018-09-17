// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toastr } from 'react-redux-toastr'
import { translate } from 'react-i18next'

import RpcPolling from '~/components/rpc-polling/rpc-polling'
import OwnAddressList from '~/components/own-addresses/own-address-list'
import { PopupMenuActions } from '~/state/reducers/popup-menu/popup-menu.reducer'
import { OwnAddressesActions, OwnAddressesState } from '~/state/reducers/own-addresses/own-addresses.reducer'
import { appStore } from '~/state/store/configureStore'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import AddAddressPopupMenu from '~/components/own-addresses/add-address-popup-menu'

import styles from './own-addresses.scss'
import HLayout from '~/theme/h-box-layout.scss'
import VLayout from '~/theme/v-box-layout.scss'

const pollingInterval = 5.0
const addressRowPopupMenuId = 'own-addresses-address-row-popup-menu-id'

type Props = {
  t: any,
	ownAddresses: OwnAddressesState
}

type State = {
  isZAddressClicked: boolean
}

/**
 * @class OwnAddresses
 * @extends {Component<Props>}
 */
class OwnAddresses extends Component<Props> {
	props: Props
  state: State

	/**
	 * @memberof OwnAddresses
	 */
  constructor(props) {
    super(props)
    this.state = {
      isZAddressClicked: false
    }
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

  onAddressRowClicked(event, address) {
    this.setState({ isZAddressClicked: address.toLowerCase().startsWith('z')})
    appStore.dispatch(PopupMenuActions.show(addressRowPopupMenuId, event.clientY, event.clientX, address))
  }

  mergeAllMinedCoinsClicked(event, address, t) {
    const confirmOptions = { onOk: () => appStore.dispatch(OwnAddressesActions.mergeAllMinedCoins(address)) }
    toastr.confirm(t(`Are you sure want to merge all the mined coins?`), confirmOptions)
  }

  mergeAllTransparentAddressCoinsClicked(event, address, t) {
    const confirmOptions = { onOk: () => appStore.dispatch(OwnAddressesActions.mergeAllRAddressCoins(address)) }
    toastr.confirm(t(`Are you sure want to merge all the transparent address coins?`), confirmOptions)
  }

  mergeAllPrivateAddressCoinsClicked(event, address, t) {
    const confirmOptions = { onOk: () => appStore.dispatch(OwnAddressesActions.mergeAllZAddressCoins(address)) }
    toastr.confirm(t(`Are you sure want to merge all the private address coins?`), confirmOptions)
  }

  mergeAllCoinsClicked(event, address, t) {
    const confirmOptions = { onOk: () => appStore.dispatch(OwnAddressesActions.mergeAllCoins(address)) }
    toastr.confirm(t(`Are you sure want to merge all the coins?`), confirmOptions)
  }

	/**
	 * @returns
	 * @memberof OwnAddresses
	 */
	render() {
    const { t } = this.props

		return (
			// Layout container
			<div
        role="none"
				className={[styles.layoutContainer, HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}
				onClick={(event) => this.hideDropdownMenu(event)}
				onKeyDown={(event) => this.hideDropdownMenu(event)}
			>
        <RpcPolling
          interval={pollingInterval}
          actions={{
            polling: OwnAddressesActions.getOwnAddresses,
            success: OwnAddressesActions.gotOwnAddresses,
            failure: OwnAddressesActions.getOwnAddressesFailure
          }}
        />

				{ /* Route content */}
				<div className={[styles.ownAddressesContainer, VLayout.vBoxChild, HLayout.hBoxContainer].join(' ')}>

					<div className={[HLayout.hBoxChild, VLayout.vBoxContainer].join(' ')}>

						{ /* Top bar */}
						<div className={[styles.topBar, HLayout.hBoxContainer].join(' ')}>

							<div className={styles.topBarTitle}>{t(`Own Addresses`)}</div>

							<div className={[styles.topBarButtonContainer, HLayout.hBoxChild].join(' ')}>
                <button
                  type="button"
                  onClick={(event) => this.onShowPrivteKeyClicked(event)}
                  onKeyDown={(event) => this.onShowPrivteKeyClicked(event)}>
                  {t(`Show Private Key`)}
                </button>

                <div
                  role="none"
                  className={[styles.addAddressButtonContainer].join(' ')}
                  onClick={(event) => this.onAddNewAddressClicked(event)}
                  onKeyDown={(event) => this.onAddNewAddressClicked(event)}
                >
                  <button type="button" className={styles.addNewAddressButton}>
                    + {t(`Add New Address`)}
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

            <OwnAddressList
              items={this.props.ownAddresses.addresses}
              frozenAddresses={this.props.ownAddresses.frozenAddresses}
              onRowClick={(e, address) => this.onAddressRowClicked(e, address)}
            />

            <PopupMenu id={addressRowPopupMenuId}>
              {this.state.isZAddressClicked &&
                <PopupMenuItem onClick={(e, address) => this.mergeAllMinedCoinsClicked(e, address, t)}>
                  {t(`Merge all mined coins here`)}
                </PopupMenuItem>
              }
              <PopupMenuItem onClick={(e, address) => this.mergeAllTransparentAddressCoinsClicked(e, address, t)}>
                {t(`Merge all transparent address coins here`)}
              </PopupMenuItem>
              <PopupMenuItem onClick={(e, address) => this.mergeAllPrivateAddressCoinsClicked(e, address, t)}>
                {t(`Merge all private address coins here`)}
              </PopupMenuItem>
              <PopupMenuItem onClick={(e, address) => this.mergeAllCoinsClicked(e, address, t)}>
                {t(`Merge all coins here`)}
              </PopupMenuItem>
            </PopupMenu>

					</div>
				</div>

			</div>
		)
	}
}


const mapStateToProps = (state) => ({
	ownAddresses: state.ownAddresses
})

export default connect(mapStateToProps, null)(translate('own-addresses')(OwnAddresses))
