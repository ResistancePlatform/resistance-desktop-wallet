// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'
import Wallet from '../../../service/bip39-service'

export type GetStartedState = {
  createNewWallet: {
    fields: {
      walletName?: string
    },
    wallet: Wallet | null,
    validationErrors: { [string]: string }
  },
  isInProgress: boolean
}

export const GetStartedActions = createActions(
  {
    EMPTY: undefined,

    CREATE_NEW_WALLET: {
      GENERATE_WALLET: undefined,
      GOT_GENERATED_WALLET: (wallet: Wallet) => wallet,

      UPDATE_FIELD: (field: string, value: string) => ({ field, value }),
      UPDATE_VALIDATION_ERRORS: errors => errors
    },

    USE_RESISTANCE: undefined
  },
  {
    prefix: 'APP/GET_STARTED'
  }
)

export const GetStartedReducer = handleActions(
  {
    [GetStartedActions.createNewWallet.gotGeneratedWallet]: (state, action) => ({
      ...state,
      createNewWallet: { ...state.createNewWallet, wallet: action.payload }
    }),
    [GetStartedActions.createNewWallet.updateField]: (state, action) => ({
      ...state,
      createNewWallet: {
        ...state.createNewWallet,
        fields: { ...state.createNewWallet.fields, [action.payload.field]: action.payload.value }
      }
    }),
    [GetStartedActions.createNewWallet.updateValidationErrors]: (state, action) => ({
      ...state,
      createNewWallet: { ...state.createNewWallet, validationErrors: action.payload }
    }),
    [GetStartedActions.useResistance]: state => ({ ...state, isInProgress: false }),
  }, preloadedState)
