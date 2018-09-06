// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'
import Wallet from '../../../service/bip39-service'

export type GetStartedState = {
  createNewWallet: {
    wallet: Wallet | null
  },
  isInProgress: boolean
}

export const GetStartedActions = createActions(
  {
    EMPTY: undefined,

    CREATE_NEW_WALLET: {
      GENERATE_WALLET: undefined,
      GOT_GENERATED_WALLET: (wallet: Wallet) => wallet,
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
    [GetStartedActions.useResistance]: state => ({ ...state, isInProgress: false }),
  }, preloadedState)
