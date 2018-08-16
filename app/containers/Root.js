// @flow
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import ReduxToastr from 'react-redux-toastr'

import App from './App'

type Props = {
	store: {},
	history: {}
}

export default class Root extends Component<Props> {
	render() {
		return (
      <Provider store={this.props.store}>
        <div style={{ height: '100%' }}>
          <ConnectedRouter history={this.props.history}>
            <App />
          </ConnectedRouter>

          <ReduxToastr
            className='customToastr'
            timeOut={400000}
            position="bottom-right"
            preventDuplicates
            closeOnToastrClick
          />
        </div>
      </Provider>
		)
	}
}
