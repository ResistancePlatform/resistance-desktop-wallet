// @flow
import { createStore, applyMiddleware, Store } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import { createHashHistory } from 'history'
import { routerMiddleware } from 'react-router-redux'

import { rootReducer, rootEpic } from '../reducers'


export const history = createHashHistory()
export let appStore: Store = null

const epicMiddleware = createEpicMiddleware()
const router = routerMiddleware(history)
const middleware = [router, epicMiddleware]
const enhancer = applyMiddleware(...middleware)

export const configureStore = initialState => {
	appStore = createStore(rootReducer, initialState, enhancer)
	epicMiddleware.run(rootEpic)
	return appStore
}
