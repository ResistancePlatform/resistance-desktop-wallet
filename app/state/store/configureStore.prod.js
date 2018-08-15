// @flow
import { createStore, combineReducers, applyMiddleware, Store } from 'redux'
import { combineEpics, createEpicMiddleware } from 'redux-observable'
import { createHashHistory } from 'history'
import { routerMiddleware } from 'react-router-redux'
import {reducer as toastrReducer} from 'react-redux-toastr'

import { NaviReducer } from '../reducers/navi/navi.reducer'
import { NaviEpics } from '../reducers/navi/navi.epic'
import { SystemInfoReducer } from '../reducers/system-info/system-info.reducer'
import { SystemInfoEpics } from '../reducers/system-info/system-info.epic'
import { OverviewReducer } from '../reducers/overview/overview.reducer'
import { OverviewEpics } from '../reducers/overview/overview.epic'
import { OwnAddressesReducer } from '../reducers/own-addresses/own-addresses.reducer'
import { OwnAddressesEpics } from '../reducers/own-addresses/own-addresses.epic'
import { SendCashReducer } from '../reducers/send-cash/send-cash.reducer'
import { SendCashEpics } from '../reducers/send-cash/send-cash.epic'
import { SettingsReducer } from '../reducers/settings/settings.reducer'
import { SettingsEpics } from '../reducers/settings/settings.epic'

export const history = createHashHistory()
const appReducers = combineReducers({
  toastr: toastrReducer,
	navi: NaviReducer,
	systemInfo: SystemInfoReducer,
	overview: OverviewReducer,
	ownAddresses: OwnAddressesReducer,
	sendCash: SendCashReducer,
	settings: SettingsReducer
})

export const appEpics = combineEpics(
	NaviEpics,
	SystemInfoEpics,
	OverviewEpics,
	OwnAddressesEpics,
	SendCashEpics,
	SettingsEpics
)

const epicMiddleware = createEpicMiddleware()

export let appStore: Store = null
const router = routerMiddleware(history)
const middleware = [router, epicMiddleware]
const enhancer = applyMiddleware(...middleware)

export const configureStore = initialState => {
	appStore = createStore(appReducers, initialState, enhancer)
	epicMiddleware.run(appEpics)
	return appStore
}
