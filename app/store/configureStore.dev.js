import { createStore, applyMiddleware, Store } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import { createHashHistory } from 'history'
import { routerMiddleware } from 'react-router-redux'
import { createLogger } from 'redux-logger'

import { rootReducer, rootEpic } from '../reducers'


export const history = createHashHistory()
export let appStore: Store = null

const epicMiddleware = createEpicMiddleware()

export const configureStore = initialState => {
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
		rootReducer,
		initialState,
		applyMiddleware(...middleware)
	)

	epicMiddleware.run(rootEpic)

	return appStore
}
