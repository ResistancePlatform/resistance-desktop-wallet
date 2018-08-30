// @flow
import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable'
import { reducer as toastrReducer } from 'react-redux-toastr'

// Reducers
import { RpcPollingReducer } from '../reducers/rpc-polling/rpc-polling.reducer'
import { PopupMenuReducer } from '../reducers/popup-menu/popup-menu.reducer'
import { NaviReducer } from '../reducers/navi/navi.reducer'
import { SystemInfoReducer } from '../reducers/system-info/system-info.reducer'
import { OverviewReducer } from '../reducers/overview/overview.reducer'
import { OwnAddressesReducer } from '../reducers/own-addresses/own-addresses.reducer'
import { SendCashReducer } from '../reducers/send-cash/send-cash.reducer'
import { SettingsReducer } from '../reducers/settings/settings.reducer'
import { AddressBookReducer } from '../reducers/address-book/address-book.reducer'

// Epics
import { OwnAddressesEpics } from '../reducers/own-addresses/own-addresses.epic'
import { NaviEpics } from '../reducers/navi/navi.epic'
import { OverviewEpics } from '../reducers/overview/overview.epic'
import { SystemInfoEpics } from '../reducers/system-info/system-info.epic'
import { SendCashEpics } from '../reducers/send-cash/send-cash.epic'
import { SettingsEpics } from '../reducers/settings/settings.epic'
import { AddressBookEpics } from '../reducers/address-book/address-book.epic'

const rootReducer = combineReducers({
  toastr: toastrReducer,
  rpcPolling: RpcPollingReducer,
  popupMenu: PopupMenuReducer,
	navi: NaviReducer,
	systemInfo: SystemInfoReducer,
	overview: OverviewReducer,
	ownAddresses: OwnAddressesReducer,
	sendCash: SendCashReducer,
	settings: SettingsReducer,
	addressBook: AddressBookReducer
})

const rootEpic = combineEpics(
	NaviEpics,
	SystemInfoEpics,
	OverviewEpics,
	OwnAddressesEpics,
	SendCashEpics,
	SettingsEpics,
	AddressBookEpics
)

export default { rootReducer, rootEpic }
