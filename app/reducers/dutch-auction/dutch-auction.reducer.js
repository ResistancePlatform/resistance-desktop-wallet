// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type DutchAuctionState = {
  status: object,
  user: {
    ethAddress: string | null,
    ethCommitted: object | null
  },
  resAddress: string | null,
  kyc: {
    tid: string | null,
    email: string | null,
    phone: string | null
  },
  credentials: {
    userId: string | null,
    accessToken: string | null
  },
  isGeneratingAddress: boolean,
  isRegistering: boolean
}

export const DutchAuctionActions = createActions(
  {
    EMPTY: undefined,

    GET_AUCTION_STATUS: undefined,
    GOT_AUCTION_STATUS: (status: object) => ({ status }),
    GET_AUCTION_STATUS_FAILED: undefined,

    GET_USER_STATUS: undefined,
    GOT_USER_STATUS: (status: object) => ({ status }),
    GET_USER_STATUS_FAILED: undefined,

    GENERATE_RES_ADDRESS: undefined,
    GENERATE_RES_ADDRESS_SUCCEEDED: (address: string) => ({ address }),
    GENERATE_RES_ADDRESS_FAILED: undefined,

    SUBMIT_KYC_DATA: (kyc: object) => ({ kyc }),

    REGISTER: undefined,
    REGISTRATION_FINISHED: undefined,

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
    [DutchAuctionActions.gotUserStatus]: (state, action) => ({
      ...state,
      user: action.payload.status
    }),
    [DutchAuctionActions.generateResAddress]: state => ({
      ...state,
      isGeneratingAddress: true,
    }),
    [DutchAuctionActions.generateResAddressSucceeded]: (state, action) => ({
      ...state,
      resAddress: action.payload.address,
      isGeneratingAddress: false,
    }),
    [DutchAuctionActions.generateResAddressFailed]: state => ({
      ...state,
      isGeneratingAddress: false,
    }),
    [DutchAuctionActions.updateCredentials]: (state, action) => ({
      ...state,
      credentials: action.payload.credentials
    }),
    [DutchAuctionActions.register]: state => ({
      ...state,
      isRegistering: true
    }),
    [DutchAuctionActions.registrationFinished]: state => ({
      ...state,
      isRegistering: false
    }),
  }, preloadedState)
