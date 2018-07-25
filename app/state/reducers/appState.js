// @flow
import { NaviState } from '../reducers/navi/navi.reducer';
import { SystemInfoState } from '../reducers/system-info/system-info.reducer';
import { OverviewState } from '../reducers/overview/overview.reducer';
import { OwnAddressesState } from '../reducers/own-addresses/own-addresses.reducer';
import { SendCashState } from '../reducers/send-cash/send-cash.reducer';
import { SettingsState } from '../reducers/settings/settings.reducer';

export type AppState = {
  navi: NaviState,
  systemInfo: SystemInfoState,
  overview: OverviewState,
  ownAddresses: OwnAddressesState,
  sendCash: SendCashState,
  settings: SettingsState
};
