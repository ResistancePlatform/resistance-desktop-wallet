// @flow
import { NaviState } from '../reducers/navi/navi.reducer'
import { SystemInfoState } from '../reducers/system-info/system-info.reducer'
import { OverviewState } from '../reducers/overview/overview.reducer'

export type AppState = {
    navi: NaviState,
    systemInfo: SystemInfoState,
    overview: OverviewState
}