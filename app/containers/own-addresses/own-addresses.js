// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'

import RpcPolling from '~/components/rpc-polling/rpc-polling'
import LedgerPolling from '~/components/ledger/ledger-polling'
import OwnAddressList from '~/components/own-addresses/own-address-list'
import { PopupMenuActions } from '~/reducers/popup-menu/popup-menu.reducer'
import { SettingsState } from '~/reducers/settings/settings.reducer'
import { OwnAddressesActions, OwnAddressesState } from '~/reducers/own-addresses/own-addresses.reducer'
import { PopupMenu, PopupMenuItem } from '~/components/popup-menu'
import {
  RoundedButton,
  RoundedButtonWithDropdown,
  MoreButton
} from '~/components/rounded-form'
import ConnectLedgerModal from '~/components/own-addresses/ConnectLedgerModal'
import ImportPrivateKeyModal from '~/components/own-addresses/ImportPrivateKeyModal'

import styles from './own-addresses.scss'
import scrollStyles from '~/assets/styles/scrollbar.scss'
import HLayout from '~/assets/styles/h-box-layout.scss'
import VLayout from '~/assets/styles/v-box-layout.scss'

const pollingInterval = 3.0
const createAddressPopupMenuId = 'own-addresses-create-address-popup-menu-id'
const privateKeysPopupMenuId = 'own-addresses-private-keys-popup-menu-id'

type Props = {
  t: any,
  settings: SettingsState,
	ownAddresses: OwnAddressesState,
  actions: object,
  popupMenu: object
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

  onAddressRowClicked(event, address) {
    this.setState({ isZAddressClicked: address.toLowerCase().startsWith('z')})
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
				className={cn(HLayout.hBoxChild, VLayout.vBoxContainer)}
			>
        <RpcPolling
          interval={pollingInterval}
          criticalChildProcess="NODE"
          actions={{
            polling: OwnAddressesActions.getOwnAddresses,
            success: OwnAddressesActions.gotOwnAddresses,
            failure: OwnAddressesActions.getOwnAddressesFailure
          }}
        />

        <LedgerPolling />

        {this.props.ownAddresses.importPrivateKeyModal.isVisible &&
          <ImportPrivateKeyModal />
        }

        {this.props.ownAddresses.connectLedgerModal.isVisible &&
          <ConnectLedgerModal />
        }

				{ /* Route content */}
				<div className={cn(styles.container, VLayout.vBoxChild, HLayout.hBoxContainer, scrollStyles.scrollbar)}>

					<div className={cn(styles.wrapper, HLayout.hBoxChild, VLayout.vBoxContainer)}>

						{ /* Top bar */}
						<div className={cn(styles.header, HLayout.hBoxContainer)}>

							<div className={styles.title}>{t(`My Addresses`)}</div>

              <div className={styles.buttonsContainer}>
                <RoundedButtonWithDropdown
                  className={styles.menuButton}
                  onDropdownClick={() => this.props.popupMenu.show(createAddressPopupMenuId)}
                  disabled={this.props.settings.childProcessesStatus.NODE !== 'RUNNING'}
                  glyph="add"
                  important
                >
                  {t(`Add new address`)}

                  <PopupMenu id={createAddressPopupMenuId} relative>
                    <PopupMenuItem onClick={() => this.props.actions.createAddress(false)}>
                      {t(`New transparent (R) address`)}
                    </PopupMenuItem>
                    <PopupMenuItem onClick={() => this.props.actions.createAddress(true)}>
                      {t(`New private (Z) address`)}
                    </PopupMenuItem>
                  </PopupMenu>

                </RoundedButtonWithDropdown>

                <RoundedButton
                  className={styles.menuButton}
                  onClick={this.props.actions.showConnectLedgerModal}
                  glyph="ledger"
                  disabled={this.props.settings.childProcessesStatus.NODE !== 'RUNNING'}
                  important
                >
                  {t(`Send RES from Ledger`)}
                </RoundedButton>

                <MoreButton
                  className={styles.moreButton}
                  onClick={e => this.props.popupMenu.show(privateKeysPopupMenuId, null, e.clientY, e.clientX)}
                  disabled={this.props.settings.childProcessesStatus.NODE !== 'RUNNING'}
                  large
                />

                <PopupMenu id={privateKeysPopupMenuId} relative>
                  <PopupMenuItem onClick={this.props.actions.initiatePrivateKeyImport}>
                    {t(`Import private key`)}
                  </PopupMenuItem>
                  <PopupMenuItem onClick={this.props.actions.initiatePrivateKeysImport}>
                    {t(`Import private keys form file`)}
                  </PopupMenuItem>
                  <PopupMenuItem onClick={this.props.actions.showPrivateKey} disabled>
                    {t(`Show private key`)}
                  </PopupMenuItem>
                  <PopupMenuItem onClick={this.props.actions.initiatePrivateKeysExport}>
                    {t(`Export private keys`)}
                  </PopupMenuItem>
                </PopupMenu>

              </div>

						</div>

            <OwnAddressList
              items={this.props.ownAddresses.addresses}
              frozenAddresses={this.props.ownAddresses.frozenAddresses}
              onRowClick={(e, address) => this.onAddressRowClicked(e, address)}
            />

					</div>
				</div>

			</div>
		)
	}
}


const mapStateToProps = (state) => ({
  settings: state.settings,
	ownAddresses: state.ownAddresses
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(OwnAddressesActions, dispatch),
  popupMenu: bindActionCreators(PopupMenuActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('own-addresses')(OwnAddresses))
