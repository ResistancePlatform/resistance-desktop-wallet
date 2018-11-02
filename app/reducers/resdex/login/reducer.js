// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export const ResDexLoginActions = createActions(
  {
    EMPTY: undefined,

    START_PORTFOLIO_CREATION: undefined,
    SAVE_SEED: undefined,
    CREATE_PORTFOLIO: undefined,
    GET_PORTFOLIOS: undefined,
    GOT_PORTFOLIOS: portfolios => ({ portfolios }),

    LOGIN: undefined,
    LOGIN_SUCCEEDED: undefined,
    LOGIN_FAILED: (errorMessage: string) => ({ errorMessage }),
    SHOW_DIALOG: undefined,

    START_RESDEX: (seedPhrase: string, walletPassword: string) => ({ seedPhrase, walletPassword }),
    INIT_RESDEX: (walletPassword: string) => ({ walletPassword }),
    STOP_RESDEX: undefined,

    FORGOT_PASSWORD: undefined,
  },
  {
    prefix: 'APP/RESDEX/LOGIN'
  }
)

export const ResDexLoginReducer = handleActions(
  {
    [ResDexLoginActions.startPortfolioCreation]: state => ({
      ...state,
      isCreatingPortfolio: true,
    }),
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
  }, preloadedState)
