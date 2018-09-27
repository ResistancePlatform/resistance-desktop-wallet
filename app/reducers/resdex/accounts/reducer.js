// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export const ResDexAccountsActions = createActions(
  {
    EMPTY: undefined,
    DEPOSIT: (currency: string) => ({ currency }),
    WITHDRAW: (currency: string) => ({ currency }),
  },
  {
    prefix: 'APP/RESDEX/ACCOUNTS'
  }
)

export const ResDexAccountsReducer = handleActions(
  {
    [ResDexAccountsActions.deposit]: (state, action) => ({
      ...state,
      depositModal: {
        isVisible: true,
        currency: action.payload.currency
      }
    }),
    [ResDexAccountsActions.withraw]: (state, action) => ({
      ...state,
      withdrawModal: {
        isVisible: true,
        currency: action.payload.currency
      }
    }),
  }, preloadedState)
