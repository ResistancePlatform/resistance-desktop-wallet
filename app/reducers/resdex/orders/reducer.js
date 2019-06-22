// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export const ResDexOrdersActions = createActions(
  {
    EMPTY: undefined,

    GET_SWAP_HISTORY: undefined,
    GOT_SWAP_HISTORY: swapHistory => ({ swapHistory }),
    GET_SWAP_HISTORY_FAILED: undefined,

    SHOW_ORDER_MODAL: (uuid: suuidtring) => ({ uuid }),
    CLOSE_ORDER_MODAL: undefined,
  },
  {
    prefix: 'APP/RESDEX/ORDERS'
  }
)

export const ResDexOrdersReducer = handleActions(
  {
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
