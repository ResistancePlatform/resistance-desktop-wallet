// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export const ResDexLoginActions = createActions(
  {
    EMPTY: undefined,
    GET_PORTFOLIOS: undefined,
    GOT_PORTFOLIOS: portfolios => ({ portfolios }),
    LOGIN: undefined,
    LOGIN_SUCCEEDED: undefined,
    FORGOT_PASSWORD: undefined,
    START_MARKET_MAKER: seedPhrase => ({ seedPhrase })
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
    [ResDexLoginActions.loginSucceeded]: state => ({
      ...state,
      isRequired: false,
    }),
  }, preloadedState)
