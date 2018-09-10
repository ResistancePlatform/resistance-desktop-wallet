// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toastr } from 'react-redux-toastr'

import { truncateAmount } from '~/constants'
import { UniformList, UniformListHeader, UniformListRow, UniformListColumn} from '~/components/uniform-list'
import RpcPolling from '~/components/rpc-polling/rpc-polling'
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

  mergeAllMinedCoinsClicked(event, address) {
    const confirmOptions = { onOk: () => appStore.dispatch(OwnAddressesActions.mergeAllMinedCoins(address)) }
    toastr.confirm(`Are you sure want to merge all the mined coins?`, confirmOptions)
  }

  mergeAllTransparentAddressCoinsClicked(event, address) {
    const confirmOptions = { onOk: () => appStore.dispatch(OwnAddressesActions.mergeAllRAddressCoins(address)) }
    toastr.confirm(`Are you sure want to merge all the transparent address coins?`, confirmOptions)
  }

  mergeAllPrivateAddressCoinsClicked(event, address) {
    const confirmOptions = { onOk: () => appStore.dispatch(OwnAddressesActions.mergeAllZAddressCoins(address)) }
    toastr.confirm(`Are you sure want to merge all the private address coins?`, confirmOptions)
  }

  mergeAllCoinsClicked(event, address) {
    const confirmOptions = { onOk: () => appStore.dispatch(OwnAddressesActions.mergeAllCoins(address)) }
    toastr.confirm(`Are you sure want to merge all the coins?`, confirmOptions)
  }

  getListHeaderRenderer() {
    return (
      <UniformListHeader>
        <UniformListColumn width="22%">Balance</UniformListColumn>
        <UniformListColumn width="18%">Confirmed</UniformListColumn>
        <UniformListColumn width="60%">Address</UniformListColumn>
      </UniformListHeader>
    )
  }

  getListRowRenderer(address: AddressRow) {
    const frozenBalance = this.props.ownAddresses.frozenAddresses[address.address]
    const balance = frozenBalance === undefined ? address.balance : frozenBalance
    const displayBalance = balance === null ? 'ERROR' : truncateAmount(balance)

    return (
      <UniformListRow key={address.address} className={frozenBalance ? styles.mergingContainer : ''} onContextMenu={e => this.onAddressRowClicked(e, address.address)}>
        {Boolean(frozenBalance) &&
          <div className={styles.merging}><span>merging</span></div>
        }
        <UniformListColumn>{displayBalance}</UniformListColumn>
        <UniformListColumn>{address.confirmed ? 'YES' : address.balance && 'NO' || ''}</UniformListColumn>
        <UniformListColumn>{address.address}</UniformListColumn>
      </UniformListRow>
    )
  }

	/**
	 * @returns
	 * @memberof OwnAddresses
	 */
	render() {
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

							<div className={styles.topBarTitle}>Own Addresses</div>

							<div className={[styles.topBarButtonContainer, HLayout.hBoxChild].join(' ')}>
                <button
                  type="button"
                  onClick={(event) => this.onShowPrivteKeyClicked(event)}
                  onKeyDown={(event) => this.onShowPrivteKeyClicked(event)}>
                  Show Private Key
                </button>

                <div
                  role="none"
                  className={[styles.addAddressButtonContainer].join(' ')}
                  onClick={(event) => this.onAddNewAddressClicked(event)}
                  onKeyDown={(event) => this.onAddNewAddressClicked(event)}
                >
                  <button type="button" className={styles.addNewAddressButton}>
                    + Add New Address
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

            <UniformList
              items={this.props.ownAddresses.addresses}
              headerRenderer={address => this.getListHeaderRenderer(address)}
              rowRenderer={address => this.getListRowRenderer(address)}
            />

            <PopupMenu id={addressRowPopupMenuId}>
              {this.state.isZAddressClicked &&
                <PopupMenuItem onClick={(e, address) => this.mergeAllMinedCoinsClicked(e, address)}>
                  Merge all mined coins here
                </PopupMenuItem>
              }
              <PopupMenuItem onClick={(e, address) => this.mergeAllTransparentAddressCoinsClicked(e, address)}>
                Merge all transparent address coins here
              </PopupMenuItem>
              <PopupMenuItem onClick={(e, address) => this.mergeAllPrivateAddressCoinsClicked(e, address)}>
                Merge all private address coins here
              </PopupMenuItem>
              <PopupMenuItem onClick={(e, address) => this.mergeAllCoinsClicked(e, address)}>
                Merge all coins here
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

export default connect(mapStateToProps, null)(OwnAddresses)
