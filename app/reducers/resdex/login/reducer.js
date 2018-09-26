// @flow
import { createActions, handleActions } from 'redux-actions'

export const ResDexLoginActions = createActions(
  {
    EMPTY: undefined,
    GET_PORTFOLIOS: undefined,
    GOT_PORTFOLIOS: portfolios => ({ portfolios }),
    LOGIN: (portfolio: string, password: string) => ({ portfolio, password }),
  },
  {
    prefix: 'APP/RESDEX/LOGIN'
  }
)

export const ResDexReducer = handleActions(
  {
    [ResDexLoginActions.gotPortfolios]: (state, action) => ({
      ...state,
      portfolios: action.payload.portfolios
    })
  }, preloadedState)
