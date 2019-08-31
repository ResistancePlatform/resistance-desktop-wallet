// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export type PrivateOrder = {
  mainUuid: string,
  privacy2Uuid: string | null,
  status: 'swapping_res_base' | 'privatizing' | 'swapping_rel_res' | 'completed' | 'failed' | 'cancelled',
  baseCurrency: Decimal,
  quoteCurrency: Decimal,
  quoteCurrencyAmount: Decimal,
  baseCurrencyAmount: Decimal,
  initialMainResBalance: Decimal,
  initialPrivacy2ResBalance: Decimal
}

export const ResDexOrdersActions = createActions(
  {
    EMPTY: undefined,

    GET_SWAP_HISTORY: undefined,
    GOT_SWAP_HISTORY: swapHistory => ({ swapHistory }),
    GET_SWAP_HISTORY_FAILED: undefined,

    SAVE_PRIVATE_ORDER: (order: PrivateOrder) => ({order}),
    SET_PRIVATE_ORDER_STATUS: (uuid: string, status: PrivateOrderStatus) => ({uuid, status}),
    LINK_PRIVATE_ORDER_TO_BASE_RES_ORDER: (uuid: string, baseResOrderUuid: string) => ({uuid, baseResOrderUuid}),

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
    [ResDexOrdersActions.setPrivateOrderStatus]: (state, action) => ({
      ...state,
      privateSwaps: {
        ...state.privateSwaps,
        [action.payload.uuid]: {
          ...(state.privateSwaps[action.payload.uuid] || {}),
          status: action.payload.status
        }
      }
    }),
    [ResDexOrdersActions.setPrivateOrderStatus]: (state, action) => ({
      ...state,
      privateSwaps: {
        ...state.privateSwaps,
        [action.payload.uuid]: {
          ...(state.privateSwaps[action.payload.uuid] || {}),
          status: action.payload.status
        }
      }
    }),
    [ResDexOrdersActions.savePrivateOrder]: (state, action) => ({
      ...state,
      privateSwaps: {
        ...state.privateSwaps,
        [action.payload.order.mainUuid]: action.payload.order
      }
    })
  }, preloadedState)
