// @flow
import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable'
import { reducer as toastrReducer } from 'react-redux-toastr'

// Reducers
import { AuthReducer } from './auth/auth.reducer'
import { RoundedFormReducer } from './rounded-form/rounded-form.reducer'
import { RpcPollingReducer } from './rpc-polling/rpc-polling.reducer'
import { PopupMenuReducer } from './popup-menu/popup-menu.reducer'
import { NaviReducer } from './navi/navi.reducer'
import { GetStartedReducer } from './get-started/get-started.reducer'
import { SystemInfoReducer } from './system-info/system-info.reducer'
import { OverviewReducer } from './overview/overview.reducer'
import { OwnAddressesReducer } from './own-addresses/own-addresses.reducer'
import { SendCashReducer } from './send-cash/send-cash.reducer'
import { SettingsReducer } from './settings/settings.reducer'
import { ResDexReducer } from './resdex/resdex.reducer'
import { AddressBookReducer } from './address-book/address-book.reducer'

// Epics
import { AuthEpic } from './auth/auth.epic'
import { GetStartedEpic } from './get-started/get-started.epic'
import { OwnAddressesEpics } from './own-addresses/own-addresses.epic'
import { NaviEpics } from './navi/navi.epic'
import { OverviewEpics } from './overview/overview.epic'
import { SystemInfoEpics } from './system-info/system-info.epic'
import { SendCashEpics } from './send-cash/send-cash.epic'
import { SettingsEpics } from './settings/settings.epic'
import { ResDexEpic } from './resdex/resdex.epic'
import { AddressBookEpics } from './address-book/address-book.epic'

const rootReducer = combineReducers({
  toastr: toastrReducer,
  auth: AuthReducer,
  roundedForm: RoundedFormReducer,
  getStarted: GetStartedReducer,
  rpcPolling: RpcPollingReducer,
  popupMenu: PopupMenuReducer,
	navi: NaviReducer,
	systemInfo: SystemInfoReducer,
	overview: OverviewReducer,
	ownAddresses: OwnAddressesReducer,
	sendCash: SendCashReducer,
	addressBook: AddressBookReducer,
	settings: SettingsReducer,
  resDex: ResDexReducer
})

const rootEpic = combineEpics(
  AuthEpic,
  GetStartedEpic,
	NaviEpics,
	SystemInfoEpics,
	OverviewEpics,
	OwnAddressesEpics,
	SendCashEpics,
	AddressBookEpics,
	SettingsEpics,
  ResDexEpic
)

export default { rootReducer, rootEpic }
