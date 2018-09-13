// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type AuthState = {
  reason: string | null,
  isLoginRequired: boolean
}

export const AuthActions = createActions(
  {
    EMPTY: undefined,

    ENSURE_LOGIN: (reason: string) => ({ reason }),
    SUBMIT_PASSWORD: undefined,

    LOGIN_SUCCEEDED: undefined,
    LOGIN_FAILED: (errorMessage: string) => ({ errorMessage })
  },
  {
    prefix: 'AUTH'
  }
)

export const AuthReducer = handleActions(
  {
    [AuthActions.ensureLogin]: state => ({
      ...state, isLoginRequired: true
    }),
    [AuthActions.loginSucceeded]: state => ({
      ...state, isLoginRequired: false
    })
  }, preloadedState)
