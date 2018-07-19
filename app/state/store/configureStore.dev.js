import { createStore, applyMiddleware, combineReducers, Store } from 'redux'
import { combineEpics, createEpicMiddleware } from 'redux-observable'
import { createHashHistory } from 'history'
import { routerMiddleware } from 'react-router-redux'
import { createLogger } from 'redux-logger'
import { NaviReducer } from '../reducers/navi/navi.reducer'
import { NaviEpics } from '../reducers/navi/navi.epic'
import { SystemInfoReducer } from '../reducers/system-info/system-info.reducer'
import { SystemInfoEpics } from '../reducers/system-info/system-info.epic'
import { OverviewReducer } from '../reducers/overview/overview.reducer'
import { OverviewEpics } from '../reducers/overview/overview.epic'
import { OwnAddressesReducer } from '../reducers/own-addresses/own-addresses.reducer'
import { OwnAddressesEpics } from '../reducers/own-addresses/own-addresses.epic'
import { SendCashReducer } from '../reducers/send-cash/send-cash.reducer'
// import { SendCashEpics } from '../reducers/send-cash/send-cash.epic'

export const history = createHashHistory()

const appReducers = combineReducers({
  navi: NaviReducer,
  systemInfo: SystemInfoReducer,
  overview: OverviewReducer,
  ownAddresses: OwnAddressesReducer,
  sendCash: SendCashReducer
})

export const appEpics = combineEpics(
  NaviEpics,
  SystemInfoEpics,
  OverviewEpics,
  OwnAddressesEpics
)

const epicMiddleware = createEpicMiddleware()

export let appStore: Store = null

export const configureStore = (initialState) => {
  // Redux Configuration
  const middleware = []

  // Logging Middleware
  const logger = createLogger({
    level: 'info',
    collapsed: true
  })

  // Skip redux logs in console during the tests
  if (process.env.NODE_ENV !== 'test') {
    middleware.push(logger)
  }

  // Router Middleware
  const router = routerMiddleware(history)
  middleware.push(router)

  // Epic middleware
  middleware.push(epicMiddleware)

  // Create Store
  appStore = createStore(
    appReducers,
    initialState,
    applyMiddleware(...middleware)
  )

  epicMiddleware.run(appEpics)

  return appStore
}
