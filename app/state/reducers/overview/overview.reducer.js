// @flow
import { AppAction } from '../appAction'

export type Transaction = {
  type?: string,
  direction?: string,
  confirmed?: string,
  amount?: string,
  date?: string,
  destinationAddress?: string
}

export type Balances = {
  transparentBalance?: number,
  privateBalance?: number,
  totalBalance?: number
}

export type OverviewState = {
  balances?: Balances,
  transactionList?: Array<Transaction>
}

const overviewActionTypePrefix = 'OVERVIEW_ACTION'

export const OverviewActions = {
  EMPTY: `${overviewActionTypePrefix}: EMPTY`,

  LOAD_BALANCES: `${overviewActionTypePrefix}: LOAD_BALANCES`,
  LOAD_BALANCES_SUCCESS: `${overviewActionTypePrefix}: LOAD_BALANCES_SUCCESS`,
  LOAD_BALANCES_FAIL: `${overviewActionTypePrefix}: LOAD_BALANCES_FAIL`,

  LOAD_TRANSACTION_LIST: `${overviewActionTypePrefix}: LOAD_TRANSACTION_LIST`,
  LOAD_TRANSACTION_LIST_SUCCESS: `${overviewActionTypePrefix}: LOAD_TRANSACTION_LIST_SUCCESS`,
  LOAD_TRANSACTION_LIST_FAIL: `${overviewActionTypePrefix}: LOAD_TRANSACTION_LIST_FAIL`,

  loadBalances: (): AppAction => ({ type: OverviewActions.LOAD_BALANCES }),
  loadBalancesSuccess: (balances: Balances): AppAction => ({ type: OverviewActions.LOAD_BALANCES_SUCCESS, payload: balances }),
  loadBalancesFail: (error: string): AppAction => ({ type: OverviewActions.LOAD_BALANCES_FAIL, payload: error }),

  loadTransactionList: (): AppAction => ({ type: OverviewActions.LOAD_TRANSACTION_LIST }),
  loadTransactionListSuccess: (transactionList: Array<Transaction>): AppAction => ({ type: OverviewActions.LOAD_TRANSACTION_LIST_SUCCESS, payload: transactionList }),
  loadTransactionListFail: (error: string): AppAction => ({ type: OverviewActions.LOAD_TRANSACTION_LIST_FAIL, payload: error }),

  empty: (): AppAction => ({ type: OverviewActions.EMPTY })
}

const initState: OverviewState = {
  balances: {
    transparentBalance: 0,
    privateBalance: 0,
    totalBalance: 0
  },
  transactionList: []
}

export const OverviewReducer = (state: OverviewState = initState, action: AppAction) => {

  switch (action.type) {
    case OverviewActions.LOAD_BALANCES_SUCCESS:
      return { ...state, balances: action.payload }

    case OverviewActions.LOAD_BALANCES_FAIL:
      return {
        ...state,
        balances: {
          transparentBalance: 0,
          privateBalance: 0,
          totalBalance: 0
        }
      }

    case OverviewActions.LOAD_TRANSACTION_LIST_SUCCESS:
      return { ...state, transactionList: action.payload }

    case OverviewActions.LOAD_TRANSACTION_LIST_FAIL:
      return { ...state, transactionList: null }

    default:
      return state
  }
}