// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type KycState = {
  tid: string | null,
  email: string | null
}

export const KycActions = createActions(
  {
    EMPTY: undefined,
    UPDATE: (tid: string, email: string) => ({tid, email}),
  },
  {
    prefix: 'APP/KYC'
  }
)

export const KycReducer = handleActions(
  {
    [KycActions.update]: (state, action) => ({
      ...state,
      ...action.payload
    }),
  }, preloadedState)
