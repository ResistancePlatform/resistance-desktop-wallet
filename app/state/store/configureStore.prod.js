// @flow
import { createStore, combineReducers, applyMiddleware, Store } from 'redux'
import { combineEpics, createEpicMiddleware } from 'redux-observable'
import { createHashHistory } from 'history'
import { routerMiddleware } from 'react-router-redux'

import { OverviewReducer } from '../reducers/overview/overview.reducer'
import { OverviewEpics } from '../reducers/overview/overview.epic'

export const history = createHashHistory()
const appReducers = combineReducers({
  overview: OverviewReducer
})

export const appEpics = combineEpics(
  OverviewEpics
)

const epicMiddleware = createEpicMiddleware()

export let appStore: Store = null
const router = routerMiddleware(history)
const middleware = [router, epicMiddleware]
const enhancer = applyMiddleware(...middleware)

export const configureStore = (initialState) => {
  appStore = createStore(appReducers, initialState, enhancer)
  epicMiddleware.run(appEpics)
  return appStore
}
