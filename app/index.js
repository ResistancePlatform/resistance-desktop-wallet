import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { configureStore, history } from './state/store/configureStore';
// import { AppState } from './state/reducers/appState'
import './app.global.scss';

// const initAppState: AppState = {
//   systemInfo: {
//     daemonInfo: {
//       status: DaemonStatus.NOT_RUNNING,
//       residentSizeMB: 0
//     },
//     blockChainInfo: {
//       connectionCount: 0,
//       blockchainSynchronizedPercentage: 0,
//       lastBlockDate: null
//     }
//   },

//   overview: {
//     balances: {
//       transparentBalance: 0,
//       privateBalance: 0,
//       totalBalance: 0
//     },
//     transactionList: []
//   }
// }

const store = configureStore();

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
