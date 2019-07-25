// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type DutchAuctionState = {
  status: object,
  resAddress: string | null,
  kyc: {
    email: string | null,
    tid: string | null
  },
  credentials: {
    userId: string | null,
    authToken: string | null
  },
  isRegistering: boolean
}

export const DutchAuctionActions = createActions(
  {
    EMPTY: undefined,

    GET_AUCTION_STATUS: undefined,
    GOT_AUCTION_STATUS: (status: object) => ({ status }),

    SUBMIT_RES_ADDRESS: undefined,
    UPDATE_RES_ADDRESS: (address: string) => ({ address }),

    SUBMIT_KYC_DATA: (kyc: object) => ({ kyc }),
    UPDATE_KYC_DATA: (kyc: object) => ({ kyc }),

    REGISTER: undefined,
    REGISTER_FINISHED: undefined,

    UPDATE_CREDENTIALS: (credentials: object) => ({ credentials }),
  },
  {
    prefix: 'APP/DUTCH_AUCTION'
  }
)

export const DutchAuctionReducer = handleActions(
  {
    [DutchAuctionActions.gotAuctionStatus]: (state, action) => ({
      ...state,
      status: action.payload.status.data
    }),
    [DutchAuctionActions.updateResAddress]: (state, action) => ({
      ...state,
      resAddress: action.payload.address
    }),
    [DutchAuctionActions.updateKycData]: (state, action) => ({
      ...state,
      kyc: action.payload.kyc
    }),
    [DutchAuctionActions.updateCredentials]: (state, action) => ({
      ...state,
      credentials: action.payload.credentials
    }),
  }, preloadedState)
