// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export const ResDexOrdersActions = createActions(
  {
    EMPTY: undefined,

    INIT_SWAP_HISTORY: undefined,
    GET_SWAP_HISTORY: undefined,
    GOT_SWAP_HISTORY: swapHistory => ({ swapHistory }),

    KICK_START_STUCK_SWAPS: undefined,
  },
  {
    prefix: 'APP/RESDEX/ORDERS'
  }
)

export const ResDexOrdersReducer = handleActions(
  {
    [ResDexOrdersActions.gotSwapHistory]: (state, action) => ({
      ...state,
      swapHistory: action.payload.swapHistory
    }),
  }, preloadedState)
