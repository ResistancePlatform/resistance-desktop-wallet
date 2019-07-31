// @flow
import { combineReducers } from 'redux'
import { combineEpics } from 'redux-observable'
import { reducer as toastrReducer } from 'react-redux-toastr'

// Reducers
import { AuthReducer } from './auth/auth.reducer'
import { RoundedFormReducer } from './rounded-form/rounded-form.reducer'
import { RpcPollingReducer } from './rpc-polling/rpc-polling.reducer'
import { LoadingPopupReducer } from './loading-popup/loading-popup.reducer'
import { PopupMenuReducer } from './popup-menu/popup-menu.reducer'
import { FetchParametersReducer } from './fetch-parameters/fetch-parameters.reducer'
import { NaviReducer } from './navi/navi.reducer'
import { GetStartedReducer } from './get-started/get-started.reducer'
import { SystemInfoReducer } from './system-info/system-info.reducer'
import { OverviewReducer } from './overview/overview.reducer'
import { OwnAddressesReducer } from './own-addresses/own-addresses.reducer'
import { SendCurrencyReducer } from './send-currency/send-currency.reducer'
import { SettingsReducer } from './settings/settings.reducer'
import { AddressBookReducer } from './address-book/address-book.reducer'
import { DutchAuctionReducer } from './dutch-auction/dutch-auction.reducer'

// Epics
import { AuthEpic } from './auth/auth.epic'
import { FetchParametersEpic } from './fetch-parameters/fetch-parameters.epic'
import { GetStartedEpic } from './get-started/get-started.epic'
import { OwnAddressesEpics } from './own-addresses/own-addresses.epic'
import { NaviEpics } from './navi/navi.epic'
import { OverviewEpics } from './overview/overview.epic'
import { SystemInfoEpics } from './system-info/system-info.epic'
import { SendCurrencyEpics } from './send-currency/send-currency.epic'
import { SettingsEpics } from './settings/settings.epic'
import { AddressBookEpics } from './address-book/address-book.epic'
import { DutchAuctionEpic } from './dutch-auction/dutch-auction.epic'

const rootReducer = combineReducers({
  toastr: toastrReducer,
  auth: AuthReducer,
  roundedForm: RoundedFormReducer,
  getStarted: GetStartedReducer,
  rpcPolling: RpcPollingReducer,
  loadingPopup: LoadingPopupReducer,
  popupMenu: PopupMenuReducer,
  fetchParameters: FetchParametersReducer,
	navi: NaviReducer,
	systemInfo: SystemInfoReducer,
	overview: OverviewReducer,
	ownAddresses: OwnAddressesReducer,
	sendCurrency: SendCurrencyReducer,
	addressBook: AddressBookReducer,
	settings: SettingsReducer,
  dutchAuction: DutchAuctionReducer,
})

const rootEpic = combineEpics(
  AuthEpic,
  FetchParametersEpic,
  GetStartedEpic,
	NaviEpics,
	SystemInfoEpics,
	OverviewEpics,
	OwnAddressesEpics,
	SendCurrencyEpics,
	AddressBookEpics,
	SettingsEpics,
  DutchAuctionEpic,
)

export default { rootReducer, rootEpic }
