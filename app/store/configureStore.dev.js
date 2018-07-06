import { createStore, applyMiddleware, combineReducers, Store } from 'redux'
import { combineEpics, createEpicMiddleware } from 'redux-observable'
import { createHashHistory } from 'history'
import { routerMiddleware } from 'react-router-redux'
import { createLogger } from 'redux-logger'

import { OverviewReducer } from '../reducers/overview'
import { OverviewEpics } from '../reducers/overview.epic'

export const history = createHashHistory()

const appReducers = combineReducers({
  overview: OverviewReducer
})

export const appEpics = combineEpics(
  OverviewEpics
)

const epicMiddleware = createEpicMiddleware()

export let appStore: Store = null;

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
  const router = routerMiddleware(history);
  middleware.push(router);

  // Epic middleware
  middleware.push(epicMiddleware);

  // Create Store
  appStore = createStore(
    appReducers,
    initialState,
    applyMiddleware(...middleware)
  )

  epicMiddleware.run(appEpics)

  return appStore
}
