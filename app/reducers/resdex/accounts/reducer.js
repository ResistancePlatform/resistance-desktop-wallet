// @flow
import { createActions, handleActions } from 'redux-actions'
import { preloadedState } from '~/reducers/preloaded.state'

export type EnabledCurrency = {
  symbol: string,
  port?: number,
  useElectrum: boolean
}

export const ResDexAccountsActions = createActions(
  {
    EMPTY: undefined,
    DEPOSIT: (symbol: string) => ({ symbol }),
    WITHDRAW: (symbol: string) => ({ symbol }),
    CLOSE_DEPOSIT_MODAL: undefined,
    CLOSE_WITDRAW_MODAL: undefined
  },
  {
    prefix: 'APP/RESDEX/ACCOUNTS'
  }
)

export const ResDexAccountsReducer = handleActions(
  {
    [ResDexAccountsActions.deposit]: (state, action) => ({
      ...state,
      depositModal: {
        isVisible: true,
        symbol: action.payload.symbol
      }
    }),
    [ResDexAccountsActions.withdraw]: (state, action) => ({
      ...state,
      withdrawModal: {
        isVisible: true,
        symbol: action.payload.symbol
      }
    }),
    [ResDexAccountsActions.closeDepositModal]: (state) => ({
      ...state,
      depositModal: { isVisible: false, symbol: null }
    }),
    [ResDexAccountsActions.closeWithdrawModal]: (state) => ({
      ...state,
      withdrawModal: { isVisible: false, symbol: null }
    }),
  }, preloadedState)
