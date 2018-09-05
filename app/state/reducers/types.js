// @flow

import { RoundedFormState } from '../reducers/rounded-form/rounded-form.reducer'
import { GetStartedState } from '../reducers/get-started/get-started.reducer'
import { RpcPollingState } from '../reducers/rpc-polling/rpc-polling.reducer'
import { PopupMenuState } from '../reducers/popup-menu/popup-menu.reducer'
import { NaviState } from '../reducers/navi/navi.reducer'
import { SystemInfoState } from '../reducers/system-info/system-info.reducer'
import { OverviewState } from '../reducers/overview/overview.reducer'
import { OwnAddressesState } from '../reducers/own-addresses/own-addresses.reducer'
import { SendCashState } from '../reducers/send-cash/send-cash.reducer'
import { SettingsState } from '../reducers/settings/settings.reducer'
import { AddressBookState } from '../reducers/address-book/address-book.reducer'

export type Action = {
    +type: string,
    payload?: any,
    meta?: any
}

export type State = {
  roundedForm: RoundedFormState,
  getStarted: GetStartedState,
	rpcPolling: RpcPollingState,
  popupMenu: PopupMenuState,
	navi: NaviState,
	systemInfo: SystemInfoState,
	overview: OverviewState,
	ownAddresses: OwnAddressesState,
	sendCash: SendCashState,
	settings: SettingsState,
	addressBook: AddressBookState
}

