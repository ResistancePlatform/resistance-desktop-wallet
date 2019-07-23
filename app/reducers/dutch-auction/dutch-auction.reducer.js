// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '../preloaded.state'

export type DutchAuctionState = {
  status: object
}

export const DutchAuctionActions = createActions(
  {
    EMPTY: undefined,

    GET_AUCTION_STATUS: undefined,
    GOT_AUCTION_STATUS: (status: object) => ({ status }),
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
  }, preloadedState)
