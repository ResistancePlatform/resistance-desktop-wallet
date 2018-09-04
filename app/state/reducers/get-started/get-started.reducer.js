// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type GetStartedState = {
  createNewWallet: {
    fields: {
      walletName?: string
    },
    mnemonicSeed?: string,
    validationErrors: { [string]: string }
  },
  isInProgress: boolean
}

export const GetStartedActions = createActions(
  {
    EMPTY: undefined,

    GENERATE_WALLET: undefined,
    UPDATE_FIELD: (field: string, value: string) => ({ field, value }),
    UPDATE_VALIDATION_ERRORS: errors => errors,

    USE_RESISTANCE: undefined
  },
  {
    prefix: 'APP/GET_STARTED'
  }
)

export const GetStartedReducer = handleActions(
  {
    [GetStartedActions.updateValidationErrors]: (state, action) => ({
      ...state,
      createNewWallet: {
        ...state.createNewWallet,
        validationErrors: action.payload
      },
      isInProgress: false
    }),
    [GetStartedActions.useResistance]: state => ({ ...state, isInProgress: false }),
  }, preloadedState)
