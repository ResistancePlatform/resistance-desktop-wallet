// @flow
import { SystemInfoState } from '../reducers/system-info/system-info.reducer'
import { OverviewState } from '../reducers/overview/overview.reducer'

export type AppState = {
    systemInfo: SystemInfoState,
    overview: OverviewState
}