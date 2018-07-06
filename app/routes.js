/* eslint flowtype-errors/show-errors: 0 */
import React from 'react'
import { Switch, Route } from 'react-router'
import App from './containers/App'
import Overview from './containers/OverviewPage'

export default () => (
  <App>
    <Switch>
      {/*
      <Route path="/own-addresses" component={OwnAddresses} />
      <Route path="/send-cash" component={SendCash} />
      <Route path="/address-book" component={AddressBook} />
      <Route path="/settings" component={Settings} /> 
      <Route exact path="/" component={Overview} />
      */}
      <Route exact path="/" component={Overview} />
      {/* <Route exact path="/" render={() => <Overview />} /> */}
    </Switch>
  </App>
)
