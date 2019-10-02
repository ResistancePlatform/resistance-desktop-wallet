// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export type ResDexKycState = {
  tid: string | null,
  email: string | null,
  isRegistered: boolean,
  isRegistering: boolean
}

export const ResDexKycActions = createActions(
  {
    EMPTY: undefined,
    UPDATE: (tid: string, email: string) => ({tid, email}),
    REGISTER: (tid: string) => ({ tid }),
    REGISTRATION_SUCCEEDED: undefined,
    REGISTRATION_FAILED: undefined,
  },
  {
    prefix: 'APP/KYC'
  }
)

export const ResDexKycReducer = handleActions(
  {
    [ResDexKycActions.update]: (state, action) => ({
      ...state,
      ...action.payload
    }),
    [ResDexKycActions.register]: state => ({
      ...state,
      isRegistering: true
    }),
    [ResDexKycActions.registrationSucceeded]: state => ({
      ...state,
      isRegistered: true,
      isRegistering: false
    }),
    [ResDexKycActions.registrationFailed]: state => ({
      ...state,
      isRegistering: false
    }),
  }, preloadedState)
