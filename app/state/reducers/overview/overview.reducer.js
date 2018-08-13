// @flow
import { createActions, handleActions } from 'redux-actions'
import { defaultAppState } from '../default-app-state'

export type Transaction = {
	type?: string,
	direction?: string,
	confirmed?: string,
	amount?: string,
	date?: string,
	destinationAddress?: string,
	transactionId?: string
}

export type Balances = {
	transparentBalance: number,
	transparentUnconfirmedBalance?: number,
	privateBalance: number,
	privateUnconfirmedBalance: number,
	totalBalance: number,
	totalUnconfirmedBalance: number
}

export type OverviewState = {
	balances?: Balances,
	transactions?: Array<Transaction>
}

export const OverviewActions = createActions(
	{
		EMPTY: undefined,

		START_GETTING_WALLET_INFO: undefined,
		STOP_GETTING_WALLET_INFO: undefined,
		GOT_WALLET_INFO: (balances: Balances) => balances,

		START_GETTING_TRANSACTION_DATA_FROM_WALLET: undefined,
		STOP_GETTING_TRANSACTION_DATA_FROM_WALLET: undefined,
		GOT_TRANSACTION_DATA_FROM_WALLET: (transactions: Array<Transaction>) => transactions,

		MAIN_WINDOW_CLOSE: undefined,
		MAIN_WINDOW_MINIMIZE: undefined,
		MAIN_WINDOW_MAXIMIZE: undefined
	},
	{
		prefix: 'APP/OVERVIEW_ACTION'
	}
)

export const OverviewReducer = handleActions({
	[OverviewActions.gotWalletInfo]: (state, action) => ({ ...state, balances: action.payload }),
	[OverviewActions.gotTransactionDataFromWallet]: (state, action) => ({ ...state, transactions: action.payload })
}, defaultAppState)