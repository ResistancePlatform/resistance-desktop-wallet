// @flow
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '~/reducers/preloaded.state'
import { ResDexBootstrappingActions } from '~/reducers/resdex/bootstrapping/reducer'


export const ResDexLoginActions = createActions(
  {
    EMPTY: undefined,

    GET_PORTFOLIOS: undefined,
    GOT_PORTFOLIOS: portfolios => ({ portfolios }),

    LOGIN: undefined,
    LOGIN_SUCCEEDED: undefined,
    LOGIN_FAILED: (errorMessage: string) => ({ errorMessage }),
    SHOW_DIALOG: undefined,

    SET_DEFAULT_PORTFOLIO: (id: string) => ({ id }),

    START_RESDEX: (seedPhrase: string, walletPassword: string) => ({ seedPhrase, walletPassword }),
    INIT_RESDEX: (walletPassword: string) => ({ walletPassword }),
    STOP_RESDEX: undefined,
  },
  {
    prefix: 'APP/RESDEX/LOGIN'
  }
)

export const ResDexLoginReducer = handleActions(
  {
    [ResDexLoginActions.gotPortfolios]: (state, action) => ({
      ...state,
      portfolios: action.payload.portfolios
    }),
    [ResDexLoginActions.login]: state => ({
      ...state,
      isInProgress: true,
    }),
    [ResDexLoginActions.loginSucceeded]: state => ({
      ...state,
      isRequired: false,
      isInProgress: false,
    }),
    [ResDexLoginActions.loginFailed]: state => ({
      ...state,
      isRequired: true,
      isInProgress: false,
    }),
    [ResDexLoginActions.showDialog]: state => ({
      ...state,
      isRequired: true,
    }),
    [ResDexLoginActions.setDefaultPortfolio]: (state, action) => ({
      ...state,
      defaultPortfolioId: action.payload.id,
    }),
    [ResDexBootstrappingActions.createPortfolio]: state => ({
      ...state,
      isInProgress: true,
    }),
  }, preloadedState)
