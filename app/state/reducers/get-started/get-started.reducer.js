// @flow
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '../preloaded.state'
import Wallet from '~/service/bip39-service'

export type GetStartedState = {
  createNewWallet: {
    wallet: Wallet | null
  },
  welcome?: {
    statusMessage: string
  },
  isCreatingNewWallet: boolean,
  isInProgress: boolean
}

export const GetStartedActions = createActions(
  {
    EMPTY: undefined,

    SET_CREATING_NEW_WALLET: (isCreatingNewWallet: boolean) => isCreatingNewWallet,

    CREATE_NEW_WALLET: {
      GENERATE_WALLET: undefined,
      GOT_GENERATED_WALLET: (wallet: Wallet) => wallet,
    },

    WELCOME: {},

    ENCRYPT_WALLET: undefined,
    AUTHENTICATE_AND_RESTORE_WALLET: undefined,
    WALLET_BOOTSTRAPPING_SUCCEEDED: undefined,
    WALLET_BOOTSTRAPPING_FAILED: (errorMessage: string) => ({ errorMessage }),

    USE_RESISTANCE: undefined
  },
  {
    prefix: 'APP/GET_STARTED'
  }
)

export const GetStartedReducer = handleActions(
  {
    [GetStartedActions.setCreatingNewWallet]: (state, action) => ({
      ...state,
      isCreatingNewWallet: action.payload
    }),
    [GetStartedActions.createNewWallet.gotGeneratedWallet]: (state, action) => ({
      ...state,
      createNewWallet: { ...state.createNewWallet, wallet: action.payload }
    }),
    [GetStartedActions.useResistance]: state => ({ ...state, isInProgress: false }),
  }, preloadedState)
