// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export const ResDexOrdersActions = createActions(
  {
    EMPTY: undefined,

    INIT_SWAP_HISTORY: undefined,
    GET_SWAP_HISTORY: undefined,
    GOT_SWAP_HISTORY: swapHistory => ({ swapHistory }),

    SHOW_ORDER_MODAL: (uuid: suuidtring) => ({ uuid }),
    CLOSE_ORDER_MODAL: undefined,

    KICK_START_STUCK_SWAPS: undefined,
    KICK_START_STUCK_SWAPS_SUCCEEDED: undefined,
    KICK_START_STUCK_SWAPS_FAILED: undefined,

    CLEANUP_PENDING_SWAPS: undefined,
    GOT_PENDING_SWAPS: (swaps: object) => ({ swaps }),
    CLEANUP_PENDING_SWAPS_FAILED: undefined,
  },
  {
    prefix: 'APP/RESDEX/ORDERS'
  }
)

export const ResDexOrdersReducer = handleActions(
  {
    [ResDexOrdersActions.kickStartStuckSwapsSucceeded]: state => ({
      ...state,
      isInitialKickStartDone: true,
    }),
    [ResDexOrdersActions.gotPendingSwaps]: (state, action) => ({
      ...state,
      pendingSwaps: action.payload.swaps,
    }),
    [ResDexOrdersActions.gotSwapHistory]: (state, action) => ({
      ...state,
      swapHistory: action.payload.swapHistory,
    }),
    [ResDexOrdersActions.showOrderModal]: (state, action) => ({
      ...state,
      orderModal: {
        isVisible: true,
        uuid: action.payload.uuid
      }
    }),
    [ResDexOrdersActions.closeOrderModal]: state => ({
      ...state,
      orderModal: { isVisible: false, uuid: null }
    }),
  }, preloadedState)
