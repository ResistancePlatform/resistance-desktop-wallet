// @flow
import { createActions, handleActions } from 'redux-actions'

import { preloadedState } from '../preloaded.state'
import Wallet from '~/service/bip39-service'

export type GetStartedState = {
  createNewWallet: {
    wallet: Wallet | null
  },
  welcome: {
    hint: string | null,
    status: 'info' | 'success' | 'error' | null,
    isBootstrapping: boolean,
    isReadyToUse: boolean
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

    ENCRYPT_WALLET: undefined,
    AUTHENTICATE_AND_RESTORE_WALLET: undefined,
    DISPLAY_HINT: (message: string) => ({ message }),
    WALLET_BOOTSTRAPPING_SUCCEEDED: undefined,
    WALLET_BOOTSTRAPPING_FAILED: (errorMessage: string) => ({ errorMessage }),

    APPLY_CONFIGURATION: undefined,
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
    [GetStartedActions.applyConfiguration]: state => ({
      ...state,
      welcome: {
        ...state.welcome,
        isBootstrapping: true
      }
    }),
    [GetStartedActions.useResistance]: state => ({ ...state, isInProgress: false }),
    [GetStartedActions.displayHint]: (state, action) => ({
      ...state,
      welcome: {
        ...state.welcome,
        hint: action.payload.message,
        status: 'info'
      }
    }),
    [GetStartedActions.walletBootstrappingFailed]: (state, action) => ({
      ...state,
      welcome: {
        ...state.welcome,
        hint: `Wallet bootstrapping has failed: ${action.payload.errorMessage}`,
        status: 'error',
        isBootstrapping: false,
        isReadyToUse: false
      }
    }),
    [GetStartedActions.walletBootstrappingSucceeded]: state => ({
      ...state,
      welcome: {
        ...state.welcome,
        hint: `Success! Your wallet has been created`,
        status: 'success',
        isBootstrapping: false,
        isReadyToUse: true
      }
    }),
  }, preloadedState)
