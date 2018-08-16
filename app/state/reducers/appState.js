// @flow
import { RpcPollingState } from '../reducers/rpc-polling/rpc-polling.reducer'
import { NaviState } from '../reducers/navi/navi.reducer'
import { SystemInfoState } from '../reducers/system-info/system-info.reducer'
import { OverviewState } from '../reducers/overview/overview.reducer'
import { OwnAddressesState } from '../reducers/own-addresses/own-addresses.reducer'
import { SendCashState } from '../reducers/send-cash/send-cash.reducer'
import { SettingsState } from '../reducers/settings/settings.reducer'
import { AddressBookState } from '../reducers/address-book/address-book.reducer'

export type AppState = {
	rpcPolling: RpcPollingState,
	navi: NaviState,
	systemInfo: SystemInfoState,
	overview: OverviewState,
	ownAddresses: OwnAddressesState,
	sendCash: SendCashState,
	settings: SettingsState,
	addressBook: AddressBookState
}

